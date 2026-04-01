import { Intern, AttendanceRecord } from './types';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

// Collection References (Mga "Folders" sa Database)
const internsRef = collection(db, 'interns');
const attendanceRef = collection(db, 'attendance');

// --- ⚡ IN-MEMORY CACHE (Ito ang magpapabilis ng sobra sa system) ⚡ ---
let cachedInterns: Intern[] | null = null;
let cachedAttendance: AttendanceRecord[] | null = null;

// --- INTERNS ---
export async function getInterns(): Promise<Intern[]> {
  // Kung may nakuha na tayong data kanina, ibigay agad! Walang loading!
  if (cachedInterns) return cachedInterns; 
  
  const snapshot = await getDocs(internsRef);
  cachedInterns = snapshot.docs.map(doc => doc.data() as Intern);
  return cachedInterns;
}

export async function generateInternId(): Promise<string> {
  const interns = await getInterns();
  const num = interns.length + 1;
  return `CAP-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
}

export async function addIntern(intern: Omit<Intern, 'id' | 'internId' | 'createdAt'>): Promise<Intern> {
  const id = uuidv4();
  const internId = await generateInternId();
  const newIntern: Intern = {
    ...intern,
    id,
    internId,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'interns', id), newIntern);
  
  // I-update agad sa cache para updated ang listahan kahit walang loading
  if (cachedInterns) cachedInterns.push(newIntern);
  return newIntern;
}

export async function updateIntern(id: string, updates: Partial<Intern>): Promise<Intern | null> {
  await updateDoc(doc(db, 'interns', id), updates);
  
  // I-update ang cache
  if (cachedInterns) {
    const idx = cachedInterns.findIndex(i => i.id === id);
    if (idx > -1) cachedInterns[idx] = { ...cachedInterns[idx], ...updates };
  }
  return await getInternById(id);
}

export async function deleteIntern(id: string): Promise<void> {
  await deleteDoc(doc(db, 'interns', id));
  
  // I-update ang cache
  if (cachedInterns) {
    cachedInterns = cachedInterns.filter(i => i.id !== id);
  }
}

export async function getInternById(id: string): Promise<Intern | null> {
  // Check muna sa cache bago mag-request sa internet
  if (cachedInterns) {
    const found = cachedInterns.find(i => i.id === id);
    if (found) return found;
  }
  const docSnap = await getDoc(doc(db, 'interns', id));
  return docSnap.exists() ? (docSnap.data() as Intern) : null;
}

// --- ATTENDANCE ---
export async function getAttendance(): Promise<AttendanceRecord[]> {
  // Instant load para sa attendance records
  if (cachedAttendance) return cachedAttendance;
  
  const snapshot = await getDocs(attendanceRef);
  cachedAttendance = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
  return cachedAttendance;
}

export async function logAttendance(internId: string): Promise<{ action: 'time_in' | 'time_out'; record: AttendanceRecord }> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const q = query(attendanceRef, where("internId", "==", internId), where("date", "==", today));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    const existingRecord = existingDoc.data() as AttendanceRecord;

    if (!existingRecord.timeOut) {
      existingRecord.timeOut = now;
      await updateDoc(doc(db, 'attendance', existingRecord.id), { timeOut: now });
      
      // Update cache
      if (cachedAttendance) {
        const index = cachedAttendance.findIndex(a => a.id === existingRecord.id);
        if (index > -1) cachedAttendance[index].timeOut = now;
      }
      return { action: 'time_out', record: existingRecord };
    }
    return { action: 'time_out', record: existingRecord };
  }

  // Time In kung wala pa
  const newRecord: AttendanceRecord = {
    id: uuidv4(),
    internId,
    date: today,
    timeIn: now,
    timeOut: null,
  };
  await setDoc(doc(db, 'attendance', newRecord.id), newRecord);
  
  // Update cache
  if (cachedAttendance) cachedAttendance.push(newRecord);
  
  return { action: 'time_in', record: newRecord };
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  // Hanapin sa cache imbes na sa internet
  if (cachedAttendance) return cachedAttendance.filter(a => a.date === date);
  
  const q = query(attendanceRef, where("date", "==", date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as AttendanceRecord);
}

export async function getAttendanceForIntern(internId: string): Promise<AttendanceRecord[]> {
  // Hanapin sa cache imbes na sa internet
  if (cachedAttendance) return cachedAttendance.filter(a => a.internId === internId);
  
  const q = query(attendanceRef, where("internId", "==", internId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as AttendanceRecord);
}

// --- AUTHENTICATION ---
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const email = username.includes('@') ? username : `${username}@caparal.com`;
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('caparal_auth', JSON.stringify({ email }));
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
  localStorage.removeItem('caparal_auth');
  // I-clear ang memory cache kapag nag-logout
  cachedInterns = null;
  cachedAttendance = null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('caparal_auth');
}

export function getAdmin() {
  const data = localStorage.getItem('caparal_auth');
  return data ? JSON.parse(data) : null;
}
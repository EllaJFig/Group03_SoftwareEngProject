import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export async function getAllListings() {
  const colRef = collection(db, "listings");
  const snapshot = await getDocs(colRef);

  const listings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return listings;
}

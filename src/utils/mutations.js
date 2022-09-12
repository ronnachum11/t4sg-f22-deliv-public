import { doc, addDoc, setDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from './firebase';

// Functions for database mutations

export const emptyEntry = {
   name: "",
   link: "",
   description: "",
   user: "",
   category: 0,
}

export async function addEntry(entry) {
   await addDoc(collection(db, "entries"), {
      name: entry.name,
      link: entry.link,
      description: entry.description,
      user: entry.user,
      category: entry.category,
      // The ID of the current user is logged with the new entry for database user-access functionality.
      // You should not remove this userid property, otherwise your logged entries will not display.
      userid: entry.userid,
   });
}

function csvToArray(str, delimiter = ",") {
   // slice from start of text to the first \n index
   // use split to create an array from string by delimiter
   const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
 
   // slice from \n index + 1 to the end of the text
   // use split to create an array of each csv value row
   const rows = str.slice(str.indexOf("\n") + 1).split("\n");
 
   // Map the rows
   // split values from each row into an array
   // use headers.reduce to create an object
   // object properties derived from headers:values
   // the object passed as an element of the array
   const arr = rows.map(function (row) {
     const values = row.split(delimiter);
     const el = headers.reduce(function (object, header, index) {
       object[header] = values[index];
       return object;
     }, {});
     return el;
   });
 
   // return the array
   return arr;
 }

export async function addMassEntries(entry, file) {
   const reader = new FileReader();
   reader.readAsText(file);
   reader.onload = function (e) {
      const text = e.target.result;
      const data = csvToArray(text);
      for (var i = 0; i < data.length; i++){
         addDoc(collection(db, "entries"), {
            name: data[i]["name"],
            link: data[i]["link"],
            description: data[i]["description"],
            user: entry.user,
            category: data[i]["category"],
            userid: entry.userid,
         });
      }
   }
}

export async function updateEntry(entry, newEntry) {
   await updateDoc(doc(db, "entries", entry.id), {
      name: newEntry.name,
      link: newEntry.link,
      description: newEntry.description,
      category: newEntry.category
   });
}

export async function deleteEntry(entry) {
   await deleteDoc(doc(db, "entries", entry.id));
}
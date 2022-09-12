import { doc, addDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { getCategory } from '../utils/categories';

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

// Experiemntal Function: tried to add upload from csv functionality but did not have enough time to finish
// export async function addMassEntries(entry, file) {
//    const reader = new FileReader();
//    reader.readAsText(file);
//    reader.onload = function (e) {
//       const text = e.target.result;
//       const data = csvToArray(text);
//       for (var i = 0; i < data.length; i++){
//          addDoc(collection(db, "entries"), {
//             name: data[i]["name"],
//             link: data[i]["link"],
//             description: data[i]["description"],
//             user: entry.user,
//             category: data[i]["category"],
//             userid: entry.userid,
//          });
//       }
//    }
// }

// updates existing document in database by changign the name, link, description, and category as reflected by user changes
export async function updateEntry(entry, newEntry) {
   await updateDoc(doc(db, "entries", entry.id), { 
      name: newEntry.name,
      link: newEntry.link,
      description: newEntry.description,
      category: newEntry.category
   });
}

// deletes an entry by the id of the one the user clicked on
export async function deleteEntry(entry) { 
   await deleteDoc(doc(db, "entries", entry.id));
}

// This method collects all links into a .csv file for downloading
export async function downloadData(user){
   var csv_data = "name,link,user,category,description\n"; // Sets up header row with column names

   const data = query(collection(db, "entries"), where("userid", "==", user?.uid)); // queries all user data
   const querySnapshot = await getDocs(data); // gets all user data

   querySnapshot.forEach((entry) => {
     csv_data += entry.data().name + "," + entry.data().link + "," + entry.data().user + "," + getCategory(entry.data().category).name + ",\"" + entry.data().description + "\",\n"; // iterates over each entry and adds it to the csv string
   });
 
   var csvFile = new Blob([csv_data], {type: "text/csv"}); // creates formatting for csv contents 
   var downloadLink = document.createElement("a"); // sets up document download location
 
   downloadLink.download = "export.csv"; // sets up document download name
   downloadLink.href = window.URL.createObjectURL(csvFile); // connects document to web path 
   downloadLink.style.display = ""; // ensures display is not visible
   document.body.appendChild(downloadLink); // connects web ptah to website
   downloadLink.click(); // initiates download
 }

 export async function eraseData(user) {
   const data = query(collection(db, "entries"), where("userid", "==", user?.uid)); // queries all user data
   const querySnapshot = await getDocs(data); // gets all user data

   querySnapshot.forEach((entry) => {
      deleteEntry(entry); // deletes each entry
   });
 }
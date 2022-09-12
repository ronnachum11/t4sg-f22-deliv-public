// List of options for entry categories
// ! DO NOT CHANGE THIS

export const categories = [
   { id: 0, name: "Default" },
   { id: 1, name: "Startup" },
   { id: 2, name: "Nonprofit" },
   { id: 3, name: "Academic" },
   { id: 4, name: "Government" },
   { id: 5, name: "Media"},
   { id: 6, name: "Other" }
];

export function getCategory(category_id) {
   return categories.find(x => x.id === category_id)
}
const fs = require('fs');
const content = fs.readFileSync('../backend-php/class_subjects.json', 'utf8');
console.log("Length:", content.length);
console.log("Char at 13000-13020:", content.substring(13000, 13020));
console.log("Char at 12990-13030:", content.substring(12990, 13030));

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJpYXQiOjE3ODc4NzIzNDgsImV4cCI6MTc4Nzg3NTk0OCwibmJmIjoxNzg3ODcyMzQ4LCJqdGkiOiJMMHh4bXAwd2JPcDVaOFhMIiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.oAgRYQnvqSaBV7VfKUxD7nF0yp_R_QWBP1udqcA_QJY';

async function testApi() {
  const endpoints = [
    'students', 'teachers', 'classes', 'subjects', 'class-subjects',
    'pins', 'skills', 'sessions', 'fees/structures', 'fees/report', 'result/progress'
  ];
  
  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/${ep}`, {
        headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
      });
      const text = await res.text();
      try {
        JSON.parse(text);
        console.log(`${ep}: Valid JSON (Length: ${text.length})`);
      } catch (err) {
        console.log(`${ep} ERROR: ${err.message}`);
        console.log(`Length: ${text.length}`);
        if (text.length > 200) {
            console.log(`Ends with: ${text.substring(text.length - 200)}`);
        }
      }
    } catch (e) {
      console.log(`Fetch error for ${ep}`);
    }
  }
}
testApi();

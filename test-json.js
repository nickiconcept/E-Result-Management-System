try { JSON.parse('"hello" "world"'); } catch(e) { console.log("Test 4:", e.toString()); }
try { JSON.parse('"hello""'); } catch(e) { console.log("Test 5:", e.toString()); }
try { JSON.parse('"'); } catch(e) { console.log("Test 6:", e.toString()); }

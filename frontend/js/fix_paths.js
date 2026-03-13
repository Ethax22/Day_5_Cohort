const fs = require('fs');
const path = require('path');
const files = ['socket.js', 'login.js', 'dashboard.js', 'board.js', 'auth.js'];
files.forEach(f => {
    let p = path.join(__dirname, f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/window\.location\.href\s*=\s*'\/([^']+)'/g, "window.location.href = '$1'");
    c = c.replace(/window\.location\.href\s*=\s*`\/([^`]+)`/g, "window.location.href = `$1`");
    c = c.replace(/window\.location\.href\s*=\s*"\/([^"]+)"/g, 'window.location.href = "$1"');
    fs.writeFileSync(p, c);
});
console.log('Redirect paths fixed.');

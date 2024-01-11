const express = require('express');
const app = express();

app.use('/public', express.static(__dirname+'/public'));
app.get('/:social', (req, res) => {
	res.sendFile(__dirname + `/public/pages/${req.params.social}.html`);
});
app.get('/', (req, res) => {
	res.sendFile(__dirname + `/public/index.html`);
});
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
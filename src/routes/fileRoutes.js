const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerMiddleware');
const fileController = require('../controller/fileController');

router.get('/files', fileController.listFiles);
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/view/:id', fileController.viewFile);
router.put('/edit/:id', fileController.editFile);
router.get('/download/:id', fileController.downloadFile);
router.get('/download-all', fileController.downloadAllFiles);
router.delete('/delete/:id', fileController.deleteFile);

module.exports = router;

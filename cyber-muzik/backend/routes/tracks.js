const express = require('express');
const router = express.Router();

// Basic route to test the music list
router.get('/', (req, res) => {
    res.json({
        status: "success",
        message: "CyberMuzik track list is ready",
        tracks: []
    });
});

module.exports = router;

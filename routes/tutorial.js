const {getTutorialsFromID, createTutorial, updateTutorial} = require('../controllers/tutorial');
const router = require('express').Router();

router.get('/:id', getTutorialsFromID)
router.post('/', createTutorial)
router.put('/:id', updateTutorial)

module.exports = router;
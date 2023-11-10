const Tutorial = require('../models/Tutorial')

const errorMsgs = {
  TUTORIAL_NOT_PROVIDED: 'tutorial not provided',
  LOOP_DETECTED: 'loop detected',
  TUTORIAL_NOT_FOUND: 'a tutorial could not be added',
  ROOT_NOT_NEW: 'top level tutorial must be new',
  ROOT_IS_NEW: 'top level tutorial must not be new'
}
const { TUTORIAL_NOT_PROVIDED, LOOP_DETECTED, TUTORIAL_NOT_FOUND, ROOT_NOT_NEW, ROOT_IS_NEW } = errorMsgs

const modes = {
  CREATE: 1,
  UPDATE: 2
}
const { CREATE, UPDATE } = modes

const sectionTypes = {
  TUTORIAL: 'tutorial',
  TEXT: 'text'
}
const { TUTORIAL, TEXT } = sectionTypes

module.exports = { ...errorMsgs, ...modes, ...sectionTypes }

module.exports.getTutorialsFromID = async (req, res) => {
  const tutorialID = req.params.id
  let tutorials = [await Tutorial.findByPk(tutorialID)]
  if (!tutorials[0]) {
    return res.status(404).send(TUTORIAL_NOT_FOUND)
  }
  const checked = new Set()

  for (let i = 0; i < tutorials.length; i++) {
    if (tutorials[i].id in checked) {
      continue
    }
    checked.add(tutorials[i].id)
    const toFind = tutorials[i].sections.filter(t => t.type === TUTORIAL).map(t => t.id)
    if (toFind.length) {
      const nextTutorials = await Tutorial.findAll({
        where: {
          id: toFind
        }
      })
      if (nextTutorials.length !== toFind.length) {
        return res.status(404).send(TUTORIAL_NOT_FOUND)
      }
      tutorials = tutorials.concat(nextTutorials)
    }
  }

  return res.status(200).json(tutorials)
}

const processTutorial = async (tutorialId, tutorialDict, visited, finished, mode) => {
  let tutorial = tutorialDict[tutorialId]

  if (!tutorial) {
    if (!Number.isInteger(tutorialId) || tutorialId < 1 || tutorialId > 2147483627) {
      throw new Error(TUTORIAL_NOT_PROVIDED)
    }

    tutorial = await Tutorial.findByPk(tutorialId)
    if (!tutorial) {
      throw new Error(TUTORIAL_NOT_FOUND)
    }
    if (mode === CREATE) {
      return tutorial.id
    }
  }

  if (finished.has(tutorialId)) {
    return
  }
  if (visited.has(tutorialId)) {
    throw new Error(LOOP_DETECTED)
  }
  visited.add(tutorialId)

  for (let i = 0; i < tutorial.sections.length; i++) {
    const sectionLink = tutorial.sections[i]
    if (sectionLink.type !== TUTORIAL) {
      continue
    }

    sectionLink.id = await processTutorial(sectionLink.id, tutorialDict, visited, finished, mode)
  }

  finished.add(tutorial.id)
  if (tutorial.isNew) {
    delete tutorial.id
    const newTutorial = await Tutorial.create(tutorial)
    return newTutorial.id
  } else if (mode === UPDATE) {
    await Tutorial.update(tutorial, {
      where: {
        id: tutorial.id
      }
    })
  }

  return tutorial.id
}

module.exports.createTutorial = async (req, res) => {
  const rootId = req.body.rootId
  const tutorialDict = req.body.tutorials

  if (!tutorialDict[rootId]) {
    return res.status(400).send(TUTORIAL_NOT_PROVIDED)
  }

  if (!tutorialDict[rootId].isNew) {
    return res.status(400).send(ROOT_NOT_NEW)
  }

  try {
    return res.status(201).json({
      rootId: await processTutorial(rootId, tutorialDict, new Set(), new Set(), CREATE)
    })
  } catch (e) {
    return res.status(400).send(e.message)
  }
}

module.exports.updateTutorial = async (req, res) => {
  const rootId = req.params.id
  const tutorialDict = req.body.tutorials

  if (!tutorialDict[rootId]) {
    return res.status(400).send(TUTORIAL_NOT_PROVIDED)
  }

  if (tutorialDict[rootId].isNew) {
    return res.status(400).send(ROOT_IS_NEW)
  }

  try {
    return res.status(201).json({
      rootId: await processTutorial(rootId, tutorialDict, new Set(), new Set(), UPDATE)
    })
  } catch (e) {
    return res.status(400).send(e.message)
  }
}

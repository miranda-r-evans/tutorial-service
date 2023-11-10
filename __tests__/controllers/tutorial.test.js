'use strict'

const request = require('supertest')
const app = require('../../app')
const Tutorial = require('../../models/Tutorial')

const { TUTORIAL_NOT_PROVIDED, LOOP_DETECTED, TUTORIAL_NOT_FOUND, ROOT_NOT_NEW, ROOT_IS_NEW } = require('../../controllers/tutorial')
const { TUTORIAL, TEXT } = require('../../controllers/tutorial')

describe('Test get tutorials', () => {
  test('Valid get tutorial call', () => {
    expect.assertions(8)
    return Tutorial.create({
      heading: 'a',
      sections: [
        {
          type: TEXT,
          value: 'aa'
        }
      ]
    })
      .then(t => {
        return request(app)
          .get(`/tutorial/${t.id}`)
      })
      .then(res => {
        const data = res.body
        expect(res.statusCode).toBe(200)
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBe(1)
        expect(typeof data[0].id).toBe('number')
        expect(Array.isArray(data[0].sections)).toBe(true)
        expect(data[0].heading).toBe('a')
        expect(data[0].sections[0].type).toBe(TEXT)
        expect(data[0].sections[0].value).toBe('aa')
      })
  })

  test('Root tutorial not found in get tutorial call', () => {
    expect.assertions(2)
    return Tutorial.destroy({
      where: {
        id: 2147483627
      },
      force: true
    })
      .then(() => {
        return request(app)
          .get('/tutorial/2147483627')
      })
      .then(res => {
        expect(res.statusCode).toBe(404)
        expect(res.text).toBe(TUTORIAL_NOT_FOUND)
      })
  })

  test('Section tutorial not found in get tutorial call', () => {
    expect.assertions(2)
    return Tutorial.destroy({
      where: {
        id: 2147483627
      },
      force: true
    })
      .then(() => {
        return Tutorial.create({
          heading: 'a',
          sections: [
            {
              type: TUTORIAL,
              id: 2147483627
            }
          ]
        })
      })
      .then(t => {
        return request(app)
          .get(`/tutorial/${t.id}`)
      })
      .then(res => {
        expect(res.statusCode).toBe(404)
        expect(res.text).toBe(TUTORIAL_NOT_FOUND)
      })
  })
})

describe('Test create tutorial', () => {
  test('Valid create tutorial call', () => {
    expect.assertions(7)
    return request(app)
      .post('/tutorial')
      .send({
        rootId: 'placeholder',
        tutorials: {
          placeholder: {
            id: 'placeholder',
            isNew: true,
            heading: 'a',
            sections: [
              {
                type: TEXT,
                value: 'aa'
              }
            ]
          }
        }
      })
      .then(async res => {
        const data = res.body
        expect(res.statusCode).toBe(201)
        expect(typeof data.rootId).toBe('number')
        const t = await Tutorial.findByPk(data.rootId)
        expect(t).not.toBe(null)
        expect(Array.isArray(t.sections)).toBe(true)
        expect(t.heading).toBe('a')
        expect(t.sections[0].type).toBe(TEXT)
        expect(t.sections[0].value).toBe('aa')
      })
  })

  test('Create tutorial call should not update an existing tutorial', () => {
    expect.assertions(1)
    let tid
    return Tutorial.create({
      heading: 'a',
      sections: []
    })
      .then(t => {
        tid = t.id
        return request(app)
          .post('/tutorial')
          .send({
            rootId: 'placeholder',
            tutorials: {
              placeholder: {
                id: 'placeholder',
                isNew: true,
                heading: '',
                sections: [
                  {
                    type: TUTORIAL,
                    id: t.id
                  }
                ]
              },
              [t.id]: {
                heading: 'b'
              }
            }
          })
      })
      .then(async () => {
        const tutorial = await Tutorial.findByPk(tid)
        expect(tutorial.heading).toBe('a')
      })
  })

  test('Root tutorial not provided in create tutorial', () => {
    expect.assertions(2)
    return request(app)
      .post('/tutorial')
      .send({
        rootId: 'placeholder',
        tutorials: {
        }
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(TUTORIAL_NOT_PROVIDED)
      })
  })

  test('Section tutorial not provided in create tutorial', () => {
    expect.assertions(2)
    return request(app)
      .post('/tutorial')
      .send({
        rootId: 'placeholder',
        tutorials: {
          placeholder: {
            id: 'placeholder',
            isNew: true,
            heading: 'a',
            sections: [{
              type: TUTORIAL,
              id: 'tempIdForTest'
            }]
          }
        }
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(TUTORIAL_NOT_PROVIDED)
      })
  })

  test('Section tutorial not found in create tutorial', () => {
    expect.assertions(2)
    return Tutorial.destroy({
      where: {
        id: 2147483627
      },
      force: true
    })
      .then(() => {
        return request(app)
          .post('/tutorial')
          .send({
            rootId: 'placeholder',
            tutorials: {
              placeholder: {
                id: 'placeholder',
                isNew: true,
                heading: 'a',
                sections: [{
                  type: TUTORIAL,
                  id: 2147483627
                }]
              }
            }
          })
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(TUTORIAL_NOT_FOUND)
      })
  })

  test('Loop detected in create tutorial', () => {
    expect.assertions(2)
    return request(app)
      .post('/tutorial')
      .send({
        rootId: 'placeholder',
        tutorials: {
          placeholder: {
            id: 'placeholder',
            isNew: true,
            heading: 'a',
            sections: [{
              type: TUTORIAL,
              id: 'loopId'
            }]
          },
          loopId: {
            id: 'loopId',
            isNew: true,
            heading: 'b',
            sections: [{
              type: TUTORIAL,
              id: 'placeholder'
            }]
          }
        }
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(LOOP_DETECTED)
      })
  })

  test('Root not new in create tutorial', () => {
    expect.assertions(2)
    return request(app)
      .post('/tutorial')
      .send({
        rootId: 'placeholder',
        tutorials: {
          placeholder: {
            id: 'placeholder',
            heading: 'a',
            sections: []
          }
        }
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(ROOT_NOT_NEW)
      })
  })
})

afterAll(() => {
  Tutorial.sequelize.close()
})

describe('Test get tutorials', () => {
  test('Valid update tutorial call with new heading, new tutorial, and text section change', () => {
    expect.assertions(16)
    let tid
    return Tutorial.create({
      heading: 'a',
      sections: [
        {
          type: TEXT,
          value: 'aa'
        }
      ]
    })
      .then(t => {
        tid = t.id
        return request(app)
          .put(`/tutorial/${t.id}`)
          .send({
            tutorials: {
              [t.id]: {
                id: t.id,
                heading: 'b',
                sections: [
                  {
                    type: TUTORIAL,
                    id: 'tempId'
                  },
                  {
                    type: TEXT,
                    value: 'bb'
                  }
                ]
              },
              tempId: {
                id: 'tempId',
                heading: 'c',
                isNew: true,
                sections: [
                  {
                    type: TEXT,
                    value: 'cc'
                  }
                ]
              }
            }
          })
      })
      .then(async res => {
        const data = res.body
        expect(res.statusCode).toBe(201)
        expect(typeof data.rootId).toBe('number')
        expect(data.rootId).toBe(tid)
        const tutorial = await Tutorial.findByPk(tid)
        expect(tutorial).not.toBe(null)
        expect(tutorial.heading).toBe('b')
        expect(Array.isArray(tutorial.sections)).toBe(true)
        expect(tutorial.sections.length).toBe(2)
        expect(tutorial.sections[0].type).toBe(TUTORIAL)
        expect(Number.isInteger(tutorial.sections[0].id)).toBe(true)
        expect(tutorial.sections[1].type).toBe(TEXT)
        expect(tutorial.sections[1].value).toBe('bb')
        const tSection = await Tutorial.findByPk(tutorial.sections[0].id)
        expect(tSection).not.toBe(null)
        expect(tSection.heading).toBe('c')
        expect(tSection.sections.length).toBe(1)
        expect(tSection.sections[0].type).toBe(TEXT)
        expect(tSection.sections[0].value).toBe('cc')
      })
  })

  test('Valid update tutorial call with existing tutorial id', async () => {
    expect.assertions(5)
    const first = await Tutorial.create({
      heading: 'a',
      sections: [
        {
          type: TEXT,
          value: 'aa'
        }
      ]
    })

    const second = await Tutorial.create({
      heading: 'a',
      sections: [
        {
          type: TEXT,
          value: 'aa'
        }
      ]
    })

    return request(app)
      .put(`/tutorial/${first.id}`)
      .send({
        tutorials: {
          [first.id]: {
            id: first.id,
            sections: [
              {
                type: TUTORIAL,
                id: second.id
              }
            ]
          }
        }
      })
      .then(async res => {
        const data = res.body
        expect(res.statusCode).toBe(201)
        expect(typeof data.rootId).toBe('number')
        expect(data.rootId).toBe(first.id)
        const t = await Tutorial.findByPk(first.id)
        expect(t.sections.length).toBe(1)
        expect(t.sections[0].id).toBe(second.id)
      })
  })

  // we will test a valid call that updates an existing section once the code is written that verifies if a root id is allowed to do that

  test('Root is new in update tutorial', () => {
    expect.assertions(2)
    return Tutorial.create({
      heading: '',
      sections: []
    })
      .then(t => {
        return request(app)
          .put(`/tutorial/${t.id}`)
          .send({
            tutorials: {
              [t.id]: {
                id: t.id,
                isNew: true,
                heading: '',
                sections: []
              }
            }
          })
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(ROOT_IS_NEW)
      })
  })

  test('Section tutorial not provided in update tutorial', () => {
    expect.assertions(2)
    return Tutorial.create({
      heading: '',
      sections: []
    })
      .then(t => {
        return request(app)
          .put(`/tutorial/${t.id}`)
          .send({
            tutorials: {
              [t.id]: {
                id: t.id,
                sections: [{
                  type: TUTORIAL,
                  id: 'tempIdForTest'
                }]
              }
            }
          })
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(TUTORIAL_NOT_PROVIDED)
      })
  })

  test('Section tutorial not found in update tutorial', () => {
    expect.assertions(2)
    return Tutorial.destroy({
      where: {
        id: 2147483627
      },
      force: true
    })
      .then(() => {
        return Tutorial.create({
          heading: '',
          sections: []
        })
      })
      .then(t => {
        return request(app)
          .put(`/tutorial/${t.id}`)
          .send({
            tutorials: {
              [t.id]: {
                id: t.id,
                sections: [{
                  type: TUTORIAL,
                  id: 2147483627
                }]
              }
            }
          })
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(TUTORIAL_NOT_FOUND)
      })
  })

  test('Loop detected in update tutorial call', async () => {
    expect.assertions(2)
    const first = await Tutorial.create({
      heading: 'a',
      sections: []
    })

    const second = await Tutorial.create({
      heading: 'b',
      sections: [
        {
          type: TUTORIAL,
          id: first.id
        }
      ]
    })

    return request(app)
      .put(`/tutorial/${first.id}`)
      .send({
        tutorials: {
          [first.id]: {
            id: first.id,
            sections: [
              {
                type: TUTORIAL,
                id: second.id
              }
            ]
          }
        }
      })
      .then(res => {
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe(LOOP_DETECTED)
      })
  })
})

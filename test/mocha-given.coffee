MochaGivenSuite = require '../lib/mocha-given'
Mocha           = module.parent.require 'mocha'
expect          = require 'expect.js'

class SuiteMock
	constructor: (@context) ->
	on: (hook, fn) ->
		fn(@context, null, Mocha)

describe 'mocha-given', ->
	Given -> @subject = {}
	And   -> MochaGivenSuite new SuiteMock @subject

	describe 'implements DSL', ->
		Then -> expect(@subject).to.have.key('Given')
		Then -> expect(@subject).to.have.key('When')
		Then -> expect(@subject).to.have.key('Then')
		Then -> expect(@subject).to.have.key('And')

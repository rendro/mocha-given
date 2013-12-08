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

	describe "assigning stuff to this", ->
		Given -> @number = 24
		And   -> @number++
		When  -> @number *= 2
		Then  -> @number == 50
		# or
		Then  -> expect(@number).to.be(50)

	describe "assigning stuff to variables", ->
		subject = null
		Given -> subject = []
		When  -> subject.push('foo')
		Then  -> subject.length == 1
		# or
		Then  -> expect(subject.length).to.be(1)

	describe "eliminating redundant test execution", ->
		timesGivenWasInvoked = timesWhenWasInvoked = 0

		context "a traditional spec with numerous Then statements", ->
			Given -> timesGivenWasInvoked++
			When  -> timesWhenWasInvoked++
			Then  -> timesGivenWasInvoked == 1
			Then  -> timesWhenWasInvoked == 2
			Then  -> timesGivenWasInvoked == 3
			Then "it's important this gets invoked separately for each spec", -> timesWhenWasInvoked == 4

		context "using And statements", ->
			Given -> timesGivenWasInvoked = timesWhenWasInvoked = 0
			And   -> timesGivenWasInvoked++
			When  -> timesWhenWasInvoked++
			Then  -> timesGivenWasInvoked == 1
			And   -> timesWhenWasInvoked == 1
			And   -> timesGivenWasInvoked == 1
			And   -> timesWhenWasInvoked == 1

	describe "And", ->
	context "following a Given", ->
		Given -> @a = 'a'
		And   -> @b = 'b' == @a #is okay to return false
		Then  -> @b == false

	context "following a Then", ->
		Given -> @meat = 'pork'
		When  -> @meat += 'muffin'
		Then  -> @meat == 'porkmuffin'
		And   -> @meat != 'hammuffin'

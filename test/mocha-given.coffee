expect = require 'expect.js'

describe 'mocha-given', ->

	describe 'implements given, when, then interface', ->
		Then -> expect(Given).to.be.a('function')
		Then -> expect(When).to.be.a('function')
		Then -> expect(Then).to.be.a('function')
		Then -> expect(And).to.be.a('function')
		Then -> expect(Invariant).to.be.a('function')

	describe 'assigning stuff to this', ->
		Given -> @number = 24
		And   -> @number++
		When  -> @number *= 2
		Then  -> @number == 50
		# or
		Then  -> expect(@number).to.be(50)

	describe 'assigning stuff to variables', ->
		subject = null
		Given -> subject = []
		When  -> subject.push('foo')
		Then  -> subject.length == 1
		# or
		Then  -> expect(subject.length).to.be(1)

	describe 'eliminating redundant test execution', ->
		timesGivenWasInvoked = timesWhenWasInvoked = 0

		context 'a traditional spec with numerous Then statements', ->
			Given -> timesGivenWasInvoked++
			When  -> timesWhenWasInvoked++
			Then  -> timesGivenWasInvoked == 1
			Then  -> timesWhenWasInvoked == 2
			Then  -> timesGivenWasInvoked == 3
			Then 'it\'s important this gets invoked separately for each spec', -> timesWhenWasInvoked == 4

		context 'using And statements', ->
			Given -> timesGivenWasInvoked = timesWhenWasInvoked = 0
			And   -> timesGivenWasInvoked++
			When  -> timesWhenWasInvoked++
			Then  -> timesGivenWasInvoked == 1
			And   -> timesWhenWasInvoked == 1
			And   -> timesGivenWasInvoked == 1
			And   -> timesWhenWasInvoked == 1

	describe 'Invariant', ->

		context 'implicitly called for each Then', ->
			Given     -> @timesInvariantWasInvoked = 0
			Invariant -> @timesInvariantWasInvoked++
			Then      -> @timesInvariantWasInvoked == 1
			And       -> @timesInvariantWasInvoked == 1

		context 'following a Then', ->
			Invariant -> expect(@meat).to.contain('pork')
			Given     -> @meat = 'pork'
			When      -> @meat += 'muffin'
			Then      -> @meat == 'porkmuffin'
			And       -> @meat != 'hammuffin'

		context 'called by And', ->
			Given     -> @a = 0
			Invariant -> @a++
			And       -> @a += 5
			Then      -> @a == 6

	describe 'And', ->
		context 'following a Given', ->
			Given -> @a = 'a'
			And   -> @b = 'b' == @a #is okay to return false
			Then  -> @b == false

		context 'following a When', ->
			Given -> @a = -> 'a'
			When  -> @b = @a()
			And   -> @b = 'b' == 'a' #is okay to return false
			Then  -> @b == false

		context 'following a Then', ->
			Given -> @meat = 'pork'
			When  -> @meat += 'muffin'
			Then  -> @meat == 'porkmuffin'
			And   -> @meat != 'hammuffin'

	describe 'giving Given a variable', ->

		context 'add a variable to `this`', ->
			Given 'pizza', -> 5
			Then -> @pizza == 5

	describe 'giving When a variable', ->

		context 'add a variable to `this`', ->
			Given 'source', -> 5
			When  'result', -> @source * 2
			Then -> @result == 10

	describe 'variable scoping', ->

		context 'not defined yet', ->
			Then -> @pizza == undefined

		context 'add a variable to `this`', ->
			Given 'pizza', -> 5
			Then -> @pizza == 5

		context 'a subsequent unrelated test run', ->
			Then -> @pizza == undefined

	describe "Givens before Whens order", ->

		context "Outer block", ->
			Given -> @a = 1
			And   -> @b = 2
			When  -> @sum = @a + @b
			Then  -> @sum == 3

			context "Middle block", ->
				Given -> @units = "days"
				When  -> @label = "#{@sum} #{@units}"
				Then  -> @label == "3 days"

				context "Inner block A", ->
					Given -> @a = -2
					Then  -> @label == "0 days"

				context "Inner block B", ->
					Given -> @units = "cm"
					Then  -> @label == "3 cm"

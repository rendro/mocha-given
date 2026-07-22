expect = require 'expect.js'

# Existing users write their specs in CoffeeScript. This file is the guard that
# a change to the JS library does not break them. It is intentionally small:
# the full behaviour is covered by test/mocha-given.js.
describe 'CoffeeScript specs still work', ->

	describe 'assigning stuff to this', ->
		Given -> @number = 24
		And   -> @number++
		When  -> @number *= 2
		Then  -> @number == 50

	describe 'assigning stuff to variables', ->
		subject = null
		Given -> subject = []
		When  -> subject.push 'foo'
		Then  -> subject.length == 1

	describe 'named Given and When', ->
		Given 'source', -> 5
		When  'result', -> @source * 2
		Then  -> @result == 10

	describe 'Invariant and And', ->
		Given     -> @a = 0
		Invariant -> @a++
		And       -> @a += 5
		Then      -> @a == 6

	describe 'async', ->
		Given (done) -> setTimeout done, 20
		Then -> expect(true).to.be(true)

	describe 'And after Then shares setup', ->
		runs = 0
		Given -> runs++
		Then -> true
		And  -> runs == 1

	describe 'promises from CoffeeScript', ->
		Given 'answer', -> Promise.resolve 42
		Then -> @answer == 42

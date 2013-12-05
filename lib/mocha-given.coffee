expect = require 'expect.js'

Mocha = if module.parent then module.parent.require('mocha') else window.Mocha
Suite = Mocha.Suite
Test  = Mocha.Test
utils = Mocha.utils

comparisonLookup =
	'===': 'to strictly equal'
	'!==': 'to strictly differ from'
	'==' : 'to equal'
	'!=' : 'to differ from'
	'>'  : 'to be bigger than'
	'>=' : 'to be bigger or equal'
	'<'  : 'to be smaller than'
	'<=' : 'to be smaller or equal'

o = (thing) ->
	isFunction: ->
		Object::toString.call(thing) is "[object Function]"

	isString: ->
		Object::toString.call(thing) is "[object String]"

	firstThat: (test) ->
		i = 0
		while i < thing.length
			return thing[i] if test(thing[i]) is true
			i++
		return undefined

stringifyExpectation = (expectation) ->
	matches = expectation.toString().replace(/\n/g,'').match(/function\s?\(.*\)\s?{\s*(return\s+)?(.*?)(;)?\s*}/i)
	if matches and matches.length >= 3 then matches[2].replace(/\s+/g, ' ').replace('void 0', 'undefined') else ""

getErrorDetails = (fn, context) ->
	expectationString = stringifyExpectation(fn)
	expectation = finalStatementFrom(expectationString)
	if comparison = wasComparison(expectation)
		left = (-> eval(comparison.left)).call context # eval is evil
		right = (-> eval(comparison.right)).call context # eval is evil
		"\n\n       Comparison: #{expectationString}\n       Expected '#{left}' #{comparisonLookup[comparison.comparator]} '#{right}'\n"
	else
		""

finalStatementFrom = (expectationString) ->
	if multiStatement = expectationString.match(/.*return (.*)/)
		multiStatement[multiStatement.length - 1]
	else
		expectationString

wasComparison = (expectation) ->
	if comparison = expectation.match(/(.*) (===|!==|==|!=|>|>=|<|<=) (.*)/)
		[s, left, comparator, right] = comparison
		{left, comparator, right}

declareSpec = (specArgs, itFunc)->
	label = o(specArgs).firstThat (arg) -> o(arg).isString()
	fn    = o(specArgs).firstThat (arg) -> o(arg).isFunction()

	if !fn.toString().replace(/\n/g,'').match(/^function\s?\(\)/i)
		itFunc "then #{label ? stringifyExpectation(fn)}", (done) ->
			try
				expect(fn.apply(@, Array.prototype.slice.call(arguments))).to.be.ok()
			catch exception
				msg = exception.message
				msg += getErrorDetails fn, @
				throw new Error msg
	else
		itFunc "then #{label ? stringifyExpectation(fn)}", ->
			try
				expect(fn.call(@)).to.be.ok()
			catch exception
				msg = exception.message
				msg += getErrorDetails fn, @
				throw new Error msg

MochaGivenSuite = (suite) ->
	suites = [suite]

	suite.on 'pre-require', (context, file, mocha) ->

		context.before = (fn) ->
			suites[0].beforeAll(fn)
			return

		context.after = (fn) ->
			suites[0].afterAll(fn)
			return

		context.beforeEach = (fn) ->
			suites[0].beforeEach(fn)
			return

		context.afterEach = (fn) ->
			suites[0].afterEach(fn)
			return

		context.describe =
		context.context = (title, fn) ->
			suite = Suite.create(suites[0], title)
			suites.unshift(suite)
			fn.call(suite)
			suites.shift()
			return suite

		context.xdescribe =
		context.xcontext =
		context.describe.skip = (title, fn) ->
			suite = Suite.create(suites[0], title)
			suite.pending = true
			suites.unshift(suite)
			fn.call(suite)
			suites.shift()
			return

		context.describe.only = (title, fn) ->
			suite = context.describe(title, fn)
			mocha.grep(suite.fullTitle())
			return suite

		context.it =
		context.specify = (title, fn) ->
			suite = suites[0]
			fn = null if suite.pending
			test = new Test(title, fn)
			suite.addTest(test)
			return test

		context.it.only = (title, fn) ->
			test = context.it(title, fn)
			reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$'
			mocha.grep(new RegExp(reString))
			return test

		context.xit =
		context.xspecify =
		context.it.skip = (title) ->
			context.it(title)
			return

		# mocha-given extension

		mostRecentlyUsed = null

		Given =
		When = context.beforeEach

		Then = ->
			declareSpec arguments, context.it

		context.Given = ->
			mostRecentlyUsed = Given
			Given.apply this, Array.prototype.slice.call arguments

		context.When = ->
			mostRecentlyUsed = When
			When.apply this, Array.prototype.slice.call arguments

		context.Then = ->
			mostRecentlyUsed = Then
			Then.apply this, Array.prototype.slice.call arguments

		context.Then.only = ->
			declareSpec arguments, this.it.only

		context.And = ->
			mostRecentlyUsed.apply this, Array.prototype.slice.call arguments

module.exports = MochaGivenSuite
Mocha.interfaces['mocha-given'] = module.exports

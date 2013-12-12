class Waterfall
	constructor: (@context, functions = [], @finalCallback) ->
		@functions = functions.slice(0)
		@asyncCount = 0
		for func in @functions
			@asyncCount += 1 if func.length > 0

	asyncTaskCompleted: =>
		@asyncCount -= 1
		@flow()

	invokeFinalCallbackIfNecessary: =>
		if @asyncCount == 0
			@finalCallback.apply(@context) if @finalCallback?
			@finalCallback = undefined

	flow: =>
		return @invokeFinalCallbackIfNecessary() if @functions.length == 0

		func = @functions.shift()

		if func.length > 0
			func.apply(@context, [@asyncTaskCompleted])
		else
			func.apply(@context)
			@flow()

module.exports = Waterfall

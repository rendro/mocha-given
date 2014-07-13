Mocha = require 'mocha'
fs = require 'fs'
path = require 'path'

require './lib/mocha-given'

mocha = new Mocha
  ui: 'mocha-given'
  reporter: 'spec'

testDir = 'test'
fs.readdirSync(testDir).filter((file) ->
  file.match /\.(coffee|js)$/
).forEach (file) ->
  mocha.addFile path.join(testDir, file)

mocha.run (failures) ->
  process.on 'exit', ->
    process.exit failures

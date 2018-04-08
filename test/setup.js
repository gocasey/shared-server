const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

global.should = chai.should();
chai.use(sinonChai);

beforeEach(() => global.sinon = sinon.sandbox.create());
afterEach(() => global.sinon.restore());

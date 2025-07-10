// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
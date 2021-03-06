var assert = require('assert'),
    patterns = require('./index.json');

patterns.forEach(function (pattern) {
    console.log(pattern.name);

    assert.strictEqual(pattern.height, pattern.cells.length);

    pattern.cells.forEach(function (row) {
        assert.strictEqual(pattern.width, row.length);

        assert.ok(row.every(function (cell) {
            return cell >= 0 && cell <= 1;
        }));
    });
});

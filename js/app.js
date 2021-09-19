function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const degreesToRadians = degrees => degrees * (Math.PI / 180);

const toothpickSettings = {
    linesCount: 10,
    maxPlaygroundWidth: 1400,
    playgroundHeight: 600,
    toothpickCount: 2000,
    throwInterval: 1
}

class Toothpick {
    constructor(length) {
        this.length = length;
        this.linesCount = toothpickSettings.linesCount;
        this.linesPositions = [];
        this.checkMaxLength();

        this.playgroundWidth = (this.length * this.linesCount) - this.length;
        this.heigth = toothpickSettings.playgroundHeight;

        this.playground = document.getElementById('playground');

        this.countOfThrows = 0;
        this.crossedLine = 0;
    }

    /**
     * Check if all lines can be displayed, if not this.length will be smaller
     */
    checkMaxLength() {
        let maxWidth = toothpickSettings.maxPlaygroundWidth;
        let actualWidth = this.length * this.linesCount;
        if (actualWidth > maxWidth) {
            this.length = maxWidth / this.linesCount;
        }
    }

    /**
     * Render playground
     */
    renderPlayground() {
        this.playground.style.width = this.playgroundWidth + 'px';
        this.playground.style.height = this.heigth + 'px';
        this.playground.style.display = 'flex';

        this.setLinesPosition();
    }

    /**
     * Render line
     * @param xPosition
     */
    renderLine(xPosition) {
        let line = document.createElement('div');
        line.setAttribute('class', 'line');
        line.style.height = this.heigth + 'px';
        line.style.left = xPosition + 'px';
        this.playground.appendChild(line);
    }

    /**
     * Set rendered lines positions to array this.linesPosition
     */
    setLinesPosition() {
        let playgroundOffsetLeft = this.playground.offsetLeft;
        this.linesPositions.push(playgroundOffsetLeft);

        this.renderLine(this.linesPositions[0]);

        for (let i = 1; i < this.linesCount; i++) {
            let previousPosition = this.linesPositions[i - 1];
            let position = parseFloat((previousPosition + this.length).toFixed(2));

            this.renderLine(position);

            this.linesPositions.push(position);
        }
    }

    /**
     * Throw a toothpicks - count is set in toothpickSettings
     * @returns {Promise<void>}
     */
    async throw() {
        for (let i = 0; i < toothpickSettings.toothpickCount; i++) {
            let coordinates = this.randomCoordinates();
            let toothpick = document.createElement('div');

            let angle = this.randomAngle();
            let x = coordinates.x;
            let y = coordinates.y;

            toothpick.setAttribute('class', 'toothpick');
            toothpick.style.transform = 'rotate(-' + angle + 'deg)';
            toothpick.style.width = this.length + 'px';
            toothpick.style.top = y + 'px';
            toothpick.style.left = x + 'px';

            this.countOfThrows++;

            this.playground.appendChild(toothpick);
            this.overwrite(x, y, angle);
            await sleep(toothpickSettings.throwInterval);
        }
    }

    /**
     * Get random angle
     * @returns {number}
     */
    randomAngle() {
        return Math.floor(Math.random() * 360);
    }

    /**
     * Get random coordinates on axis
     * @returns {{x: number, y: number}}
     */
    randomCoordinates() {
        let minX = this.playground.offsetLeft;
        let maxX = this.playgroundWidth + minX;
        let minY = this.playground.offsetTop + this.length / 2;
        let maxY = toothpickSettings.playgroundHeight;

        let x = Math.floor(Math.random() * (maxX - minX) + minX);
        let y = Math.floor(Math.random() * (maxY - minY) + minY);

        return {
            x: x,
            y: y
        };
    }

    /**
     * check if toothpick crossed a line
     * @param x - toothpick X axis
     * @param y - toothpick Y axis
     * @param angle - angle of toothpick
     * @returns {boolean}
     */
    evaluate(x, y, angle) {
        let backwards = false;

        if (angle > 90 && angle < 270) {
            backwards = true;
        }

        let realAngle = angle <= 180 ? angle : Math.abs(angle - 180);
        let rightAngleRadians = degreesToRadians(90);
        let realAngleRadians = degreesToRadians(realAngle);

        let anotherLeg = (this.length / Math.sin(rightAngleRadians)) * Math.sin(realAngleRadians); // Sine formula
        let result = Math.sqrt(Math.pow(this.length, 2) - Math.pow(anotherLeg, 2)); // Pythagoras theorem

        result = parseFloat(result.toFixed(10));

        let toothpickRange = {};

        if (backwards) {
            toothpickRange.a = (x - result);
            toothpickRange.b = x;
        } else  {
            toothpickRange.a = x;
            toothpickRange.b = x + result;
        }

        for (let position of this.linesPositions) {
            if (toothpickRange.a <= position && position <= toothpickRange.b) {
                return true;
            }
        }

        return false;
    }

    /**
     * N - all toothpicks
     * C - crossing a line
     * P = 2N/C
     * Recalculate PI number
     * @returns {number}
     */
    recalculate() {
        return (2 * this.countOfThrows) / this.crossedLine;
    }

    /**
     * Overwrite actual values in HTML / set new values
     * @param x
     * @param y
     * @param angle
     */
    overwrite(x, y, angle) {
        if (this.evaluate(x, y, angle)) {
            this.crossedLine++;
        }

        let pi = this.recalculate().toFixed(5);

        let toothpicksCountElement = document.getElementById('toothpick-count');
        let crossingLineElement = document.getElementById('crossing');
        let piElement = document.getElementById('pi');

        toothpicksCountElement.innerText = this.countOfThrows;
        crossingLineElement.innerText = this.crossedLine;
        piElement.innerText = pi || 0;
    }

    /**
     * Start program
     */
    simulate() {
        this.renderPlayground();
        this.throw().then(r => {
            console.log('END');
        });
    }
}

const toothpick = new Toothpick(100);
toothpick.simulate();
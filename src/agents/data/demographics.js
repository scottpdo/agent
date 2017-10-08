import _ from 'lodash';

import firstnames from './firstnames';
import lastnames from './lastnames';

export default {

	firstname: () => _.sample(firstnames),

	lastname: () => _.sample(lastnames),

	age: (min, max) => {

		if (min && max) return _.random(min, max);
		
		let r = Math.random();
		let s = Math.random();
		
		// return a random age btw 0 and 45
		if (r < 0.6) return Math.round(s * 45);

		// return a random age btw 45 and 100
		s *= 55;
		s += 45;
		s = Math.round(s);
		return s;
	},

	survives: (age) => {

		let r = Math.random();

		let chance = age / 100;

		if (age < 30) {
			chance = 0.004;
		} else if (age < 50) {
			chance = 0.04;
		} else if (age < 80) {
			chance = 0.08;
		} else {
			chance = chance * chance * chance;
		}

		// if true, alive
		// if false, dead
		return r > chance;
	},

	procreates: (age, spouseAge) => {

		let r = Math.random();

		let chance = 45 - (age + spouseAge) / 2;
		chance /= 250;

		chance = Math.max(0, chance);

		// if true, procreates
		// if false, nope
		return r < chance;
	}
};
import _ from 'lodash';
import uuid from 'uuid/v1';

import demographics from '../../data/demographics';
import firstnames from '../../data/firstnames';
import lastnames from '../../data/lastnames';

import Family from './Family';
import Citizen from '../individuals/Citizen';

export default class Society {

	constructor(year, startPopulation) {

		this.year = year;

		this.population = 0;
		this.families = [];
		this.citizens = [];

		this.seed(startPopulation);

		// select 9 random elders
		const isElder = (citizen) => citizen.age >= 45 && citizen.age <= 88;
		let elders = _.sampleSize(_.filter(this.citizens, isElder), 9);
		elders.map(citizen => citizen.elder = true);

		this.sort();
	}

	sort() {
		// sort by age
		this.citizens = _.sortBy(this.citizens, [citizen => citizen.age]);
	}

	seed(startPopulation) {
		
		while (this.population < startPopulation) {

			const family = new Family(this);
			
			this.families.push(family);
			
			family.members.forEach(member => this.citizens.push(member));

			this.population += family.size;
		}
	}

	increment(year) {

		this.year = year;
	
		// the dead cannot act in the earthly realm
		// and we are not modeling the afterlife
		// perhaps in another simulation
		const citizens = this.citizens.filter(citizen => citizen.alive);
	
		citizens.forEach((citizen) => {
		  
			citizen.age++;

			// deaths
			if (!demographics.survives(citizen.age)) {

				this.population--;
				citizen.die(year);

				// dead and done
				return;
			}

			// nothing for young folks to do past this point
			if (citizen.age < 21) return;
			
			// if unmarried, might marry
			if (citizen.spouse === null) {
				
				citizen.mightMarry(year);

			// if married, might have a child
			} else if (demographics.procreates(citizen.age, citizen.spouse.age)) {

				const child = citizen.family.addChild(citizen, citizen.spouse, year);
				
				this.citizens.push(child);
				this.population++;
			}
		});

		// election year?
		// if (year % 4 === 0) {
		// 	const elders = this.citizens.filter(citizen => citizen.elder);
		// 	this.citizens.forEach(citizen => citizen.vote(year, elders));
		// }

		this.sort();
	}
};
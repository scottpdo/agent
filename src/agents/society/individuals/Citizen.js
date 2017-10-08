import _ from 'lodash';
import Agent from './Agent';
import LifeEvent from '../LifeEvent';

import demographics from '../../data/demographics';

export default class Citizen extends Agent {

	constructor(family) {
		
		super();
		
		this.family = family;
		this.society = family.society;
		this.name = demographics.firstname();

		this.spouse = null;
		this.parents = [];
		this.children = [];

		this.birthYear = this.society.year;
	}

	fullName() {
		return this.name + " " + this.family.name;
	}

	marry(citizen) {

		const year = this.society.year;

		this.spouse = citizen;
		citizen.spouse = this;

		this.record(new LifeEvent(year, "marry", citizen));
		citizen.record(new LifeEvent(year, "marry", this));

		// TODO: complicate family realignment
		citizen.family.size--;
		citizen.family = this.family;
		citizen.family.size++;
	}

	// TODO: family realignment
	divorce(citizen) {
		this.spouse = null;
		citizen.spouse = null;

		// TODO
		// citizen.family = ???
	}

	vote(year, elders) {

		// must be 18 to vote
		if (this.age < 18) return;

		const choice = elders[_.random(0, elders.length - 1)];
		this.record(new LifeEvent(year, "voteFor", choice));
	}

	// TODO
	siblings() {
		let sibs = [];
		this.parents.forEach(parent => {
			parent.children.forEach(child => sibs.push(child));
		});
		sibs = _.uniq(sibs).filter(c => c !== this);
		return sibs;
	}

	die(year) {

		// record death before they're actually dead...
		this.record(new LifeEvent(year, "die", this));
		
		// now they're dead
		this.alive = false;
		this.deathYear = year;

		// and their family size shrinks
		this.family.size--;

		if (this.spouse !== null) {
			this.spouse.record(new LifeEvent(year, "spouseDie", this));
			this.spouse.spouse = null;
		}

		this.siblings().forEach(sibling => sibling.record(new LifeEvent(year, "siblingDie", this)));
		this.parents.forEach(parent => parent.record(new LifeEvent(year, "childDie", this)));
	}

	mightMarry(year) {
		
		let eligible = this.society.citizens.filter((citizen) => {
			return (
				citizen.alive &&
				citizen.age > 20 && 
				citizen.spouse === null && 
				citizen !== this &&
				citizen.family !== this.family
			);
		});

		if (eligible.length === 0) return;

		let r = Math.random();
		let oddsOfMarrying = Math.random(); // TODO: put in demographics

		if (r < oddsOfMarrying) this.marry(_.sample(eligible));
	}

	mightProcreate(year) {

		let r = Math.random();
		let oddsOfProcreating = 0.1 * Math.random();
		let doesProcreate = r < oddsOfProcreating;

		if (doesProcreate) return this.family.addChild(this, this.spouse);
		
		return null;
	}
};
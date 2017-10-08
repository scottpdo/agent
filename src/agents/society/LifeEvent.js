const types = [
  "born",
  "bornTo",
  "siblingBorn",
  "marry",
  "haveChild",
  "die",
  "spouseDie",
  "childDie",
  "siblingDie",
];

export default class LifeEvent {

  constructor(year, type, target) {

      if (types.indexOf(type) < 0) throw new Error("LifeEvent type not recognized.");

      this.year = year;
      this.type = type;
      this.target = target;
  }

  info(self) {
      
      let output = this.year + ": ";

      switch (this.type) {
          case "born":
              output += self.name + " born";
              break;
          case "siblingBorn":
              output += "sibling " + this.target.name + " born";
              break;                
          case "bornTo":
              output += self.name + " born to " + self.parents[0].name + " and " + self.parents[1].name;
              break;
          case "marry":
              output += self.name + " marries " + this.target.name;
              break;
          case "haveChild":
              // TODO: Couples have children, for now just put self
              // output += self.name + " and " + self.spouse.name + " have " + this.target.name;
              output += self.name + " and spouse ... have " + this.target.name;
              break;
          case "die":
              output += self.name + " dies";
              break;
          case "spouseDie":
              output += "spouse " + this.target.name + " dies";
              break;
          case "childDie":
              output += "child " + this.target.name + " dies";
              break;
          case "siblingDie":
              output += "sibling " + this.target.name + " dies";
              break;
          default:
              break;
      }

      return output;
  }
};
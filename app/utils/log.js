const format = (name, ...args) => `${new Date().toLocaleString()} ${name}: ${args.join(", ")}`;

module.exports = class Log {
  constructor(name) {
    this.name = name;
  }

  Info(...args) {
    console.log(format(this.name, args));
  }
}

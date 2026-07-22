Given(function () { this.t = Date.now(); });
Then.after(1500, function () { return Date.now() - this.t >= 1400; });

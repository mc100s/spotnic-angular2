export class GooglePlace {
  constructor(public id: string, // eg: "691b237b0322f28988f3ce03e321ff72a12167fd"
              public description: string, // eg: "Paris, France"
              public score: number = 0, // The importance of the place
  ) {}
}
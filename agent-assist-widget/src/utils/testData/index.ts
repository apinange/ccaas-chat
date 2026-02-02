export const socketHistory = () => [
  {
    leg: "AGENT",
    utt: "Hi!",
    confidence: 1.0,
    words: [
      { word: "Hi", conf: 1.0 },
      { word: "!", conf: 1.0 },
    ],
    is_final: true,
  },
  {
    leg: "USER",
    utt: "one two three",
    confidence: 0.92,
    words: [
      { word: "one", conf: 0.92 },
      { word: "two", conf: 0.84 },
      { word: "three", conf: 1.0 },
    ],
    is_final: true,
  },
  {
    leg: "AGENT",
    utt: "i would like to know my balance bla bla bla bla bla bla bla bla",
    confidence: 1.0,
    words: [
      { word: "i", conf: 1.0 },
      { word: "would", conf: 1.0 },
      { word: "like", conf: 1.0 },
      { word: "to", conf: 1.0 },
      { word: "know", conf: 1.0 },
      { word: "my", conf: 1.0 },
      { word: "balance", conf: 1.0 },
    ],
    is_final: true,
  },
  {
    leg: "USER",
    utt: "three",
    confidence: 0.92,
    words: [{ word: "three", conf: 1.0 }],
    is_final: true,
  },
];

export const ttfUserFinal = () => ({
  leg: "USER",
  utt: "one two three",
  confidence: 0.92,
  words: [
    { word: "one", conf: 0.92 },
    { word: "two", conf: 0.84 },
    { word: "three", conf: 1.0 },
  ],
  is_final: true,
});

export const ttfAgentFinal = () => ({
  leg: "AGENT",
  utt: "i would like to know my balance",
  confidence: 1.0,
  words: [
    { word: "i", conf: 1.0 },
    { word: "would", conf: 1.0 },
    { word: "like", conf: 1.0 },
    { word: "to", conf: 1.0 },
    { word: "know", conf: 1.0 },
    { word: "my", conf: 1.0 },
    { word: "balance", conf: 1.0 },
  ],
  is_final: true,
});

export const ttfAgentNonFinal = () => ({
  leg: "AGENT",
  utt: "i would like to know my balance [speech ended]",
  is_final: false,
});

export const ttfUserNonFinal = () => ({
  leg: "USER",
  utt: "one two three",
  is_final: false,
});

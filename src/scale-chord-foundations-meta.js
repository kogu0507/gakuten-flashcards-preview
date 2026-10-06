export const scaleFoundationIds = ['scale','tonic','major-half-steps','natural-minor-half-steps','harmonic-minor-seventh','melodic-minor-ascending','melodic-minor-descending'].map(slug=>'scale-foundation-'+slug);
export const chordFoundationIds = ['chord','root','triad','seventh','root-position','inversion'].map(slug=>'chord-foundation-'+slug);
export const scaleChordFoundationIds = [...scaleFoundationIds,...chordFoundationIds];

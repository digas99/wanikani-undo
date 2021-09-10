// https://community.wanikani.com/t/how-to-check-if-answer-is-correct-or-not/47194/7
const length_condition = (d, l) => {
	let condition;
	if (l <= 3) condition = 0;
	else if (l >= 4 && l <= 5) condition = 1;
	else if (l >= 6 && l <= 7) condition = 2;
	else condition = 2 + Math.floor(l/7);
	return d <= condition;
}

// https://stackoverflow.com/a/41815396/11488921
const create_matrix = (nlines, ncols, filler) => {
	return Array(nlines).fill(null).map(() => Array(ncols).fill(filler));
}

// https://dzone.com/articles/javascript-implementation
const levenshtein = (s1, s2) => {
	let i, j, cost;
	// length + 1 because of the empty string
	let m = create_matrix(s1.length+1, s2.length+1, null);

	if (s1.length == 0) return s2.length;
	if (s2.length == 0) return s1.length;

	// fill the matrix for the distances with empty strings
	for (i = 0; i <= s1.length; i++) {
		m[i][0] = i;
	}
	for (i = 0; i <= s2.length; i++) {
		m[0][i] = i;
	}

	for (i = 1; i <= s1.length; i++) {
		for (j = 1; j <= s2.length; j++) {
			cost = s1.charAt(i-1) == s2.charAt(j-1) ? 0 : 1;
			m[i][j] = Math.min(
				m[i-1][j] + 1,
				m[i][j-1] + 1,
				m[i-1][j-1] + cost
			);

			if (i > 1 && j > 1 && s1.charAt(i-1) == s2.charAt(j-2) && s1.charAt(i-2) == s2.charAt(j-1)) {
				m[i][j] = Math.min(
					m[i][j],
					m[i-2][j-2] + cost
				);
			}
		}
	}

	return m[s1.length][s2.length];
}
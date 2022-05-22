import * as path from 'path'

export function unixCommonPath(pathMat: Array<Array<string>>): string[] {
  const [min, max] = pathMat.reduce(
    (p, n) => {
      if (n > p[1]) {
        p[1] = n
      }
      if (n < p[0]) {
        p[0] = n
      }
      return p
    },
    [pathMat[0], pathMat[0]]
  )
  let common: string[] = []
  for (let i = 0; i < min.length; i++) {
    if (min[i] !== max[i]) {
      common = min.slice(0, i)
      break
    }
  }
  return common
}

export function buildTree(
  commonPath: string[],
  pathMatrix: Array<Array<string>>
) {
  return pathMatrix.reduce((p: any, n) => {
    let _ref = p
    const _original = path.sep.concat([...commonPath, ...n].join(path.sep))
    while (n.length > 2) {
      const shifted = n.shift()
      if (shifted) {
        if (!_ref[shifted]) {
          _ref[shifted] = {}
        }
        _ref = _ref[shifted]
      }
    }
    const [parent, base] = n
    if (n.length === 2) {
      if (
        _ref[parent] &&
        Object.getPrototypeOf(_ref[parent]) === Object.getPrototypeOf({})
      ) {
        if (!Array.isArray(_ref[parent]._core)) {
          _ref[parent]._core = []
        }
        _ref[parent]._core.push({ label: base, location: _original })
      } else if (!Array.isArray(_ref[parent])) {
        _ref[parent] = []
      }
      if (Array.isArray(_ref[parent])) {
        _ref[parent].push({ label: base, location: _original })
      }
    }
    if (n.length === 1) {
      if (!Array.isArray(_ref._core)) {
        _ref._core = []
      }
      _ref._core.push({ label: n[0], location: _original })
    }
    return p
  }, {})
}

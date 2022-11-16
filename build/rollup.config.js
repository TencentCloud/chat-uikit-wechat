import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  input: './TUIKitCore/TuikitCore.js',
  output: {
    file: './build/dist/TuikitCore.js',
    format: 'umd',
    sourcemap: true,
    name: 'TUIKit',
  },
  watch: {
    exclude: 'node_modules/**',
  },
  plugins: [
    commonjs({
      include: ['node_modules/**'],
    }),
    globals(),
    builtins(),
    // 代码压缩
    terser(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
    }),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'), // 源码里可以使用 ENV 来做条件判断
    }),
  ],
};

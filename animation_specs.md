### 背景アニメーション仕様書 (`assets/js/common.js`)

#### 1. 概要

この仕様書は、ウェブサイトの各セクション（Hero, Column, Access）の背景で動作しているThree.js製アニメーションの構造と設定方法について説明します。

アニメーションは、主要な設定オブジェクト`sceneConfigurations`によって一元管理されており、セクションごとに異なる見た目や動きを簡単に設定できるようになっています。

#### 2. 主要設定オブジェクト: `sceneConfigurations`

アニメーションのすべての設定は、`sceneConfigurations`という名前の配列オブジェクトに集約されています。

```javascript
const sceneConfigurations = [
    {
        id: 'hero-canvas',
        // ... hero-sectionの設定
    },
    {
        id: 'column-canvas',
        // ... column-sectionの設定
    },
    {
        id: 'access-canvas',
        // ... access-sectionの設定
    }
];
```

この配列内の各オブジェクトが、HTML内の各`<canvas>`要素に対応しており、それぞれのアニメーションを定義します。

##### 各設定プロパティの説明

| プロパティ | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | `String` | アニメーションを適用するHTML要素のID。 |
| `particleCount` | `Number` | 表示されるパーティクル（キラキラ）の総数。 |
| `colorPalette` | `Array` | パーティクルの色の配列。この配列の中からランダムに色が選ばれます。色は`new THREE.Color(0x******)`の形式で指定します。 |
| `sizeRange` | `Array` | パーティクルの最小サイズと最大サイズを `[最小値, 最大値]` の形式で指定します。 |
| `animationType` | `String` | アニメーションの挙動を決定するキーワード。 `'rising'` または `'expanding'` を指定します。 |
| `blending` | `Number` | Three.jsのブレンドモードを指定します。（例: `THREE.NormalBlending`, `THREE.AdditiveBlending`） |
| `fragmentShaderType`| `String` | パーティクルの見た目を決めるフラグメントシェーダーの種類。`'simple'` または `'flare'` を指定します。 |

---

#### 3. アニメーションタイプ詳細

`animationType`プロパティによって、アニメーションの動きが大きく2種類に分かれます。

##### `animationType: 'rising'`

-   **対象セクション:** Hero (`hero-canvas`)
-   **動き:**
    -   パーティクルは、画面の下から上へまっすぐ移動します。
    -   画面の上端に達すると、画面下部のランダムな位置に再出現し、再び上昇します。
-   **見た目:**
    -   **シェーダー:** `simple` （くっきりした円形）
    -   **ブレンドモード:** `NormalBlending`
    -   **色:** `colorPalette`で指定された白系の色がランダムに使用されます。
    -   **サイズ:** `sizeRange`で指定された範囲内のランダムな大きさで、サイズは変化しません。
    -   **透明度:** `0.4`～`0.9`の範囲で、パーティクルごとにランダムな値が設定され、終始変わりません。
-   **関連コード:** `animate`関数内の `if (config.animationType === 'rising') { ... }` ブロックで制御されています。

##### `animationType: 'expanding'`

-   **対象セクション:** Column (`column-canvas`), Access (`access-canvas`)
-   **動き:**
    -   パーティクルは、出現場所からゆっくりとランダムな方向に漂い続けます。
-   **見た目（アニメーションサイクル）:**
    -   **シェーダー:** `flare` （中心が明るく、外側がぼやけた形）
    -   **ブレンドモード:** `AdditiveBlending` （色が重なると明るくなる）
    1.  **出現 (Fade In):** 透明度0の状態から、「ふわっと」徐々に表示されます。
    2.  **拡大 & 消滅 (Fade Out):** 一定の透明度に達すると、今度はサイズを大きくしながら、ゆっくりと透明になって消えていきます。
    3.  **再出現:** 完全に消えると、画面内の別のランダムな位置にリセットされ、再び①の出現アニメーションからサイクルを繰り返します。
    -   **色:** `colorPalette`で指定された複数の色がランダムに使用されます。
-   **関連コード:** `animate`関数内の `else if (config.animationType === 'expanding') { ... }` ブロックで制御されています。

---

#### 4. シェーダータイプ詳細

`fragmentShaderType`プロパティによって、パーティクルの見た目が変わります。

-   **`simple`**: くっきりとした円形のパーティクルを描画します。`gl_FragColor`に直接色と透明度を設定するシンプルなシェーダーです。
-   **`flare`**: 中心が最も明るく、外側に向かって滑らかに消えるフレアのような効果を生み出します。パーティクルの座標を計算し、中心からの距離に応じてアルファ値を調整しています。

---

#### 5. 設定の変更方法（例）

アニメーションの見た目を変更したい場合は、`sceneConfigurations`オブジェクトの値を書き換えるだけで簡単に行えます。

**例1: Columnセクションのパーティクルを大きく、少なくしたい場合**

`id: 'column-canvas'` のオブジェクトを探し、`particleCount`と`sizeRange`の値を変更します。

```javascript
// 変更前
{
    id: 'column-canvas',
    particleCount: 50,
    sizeRange: [10, 40],
    // ...
},

// 変更後
{
    id: 'column-canvas',
    particleCount: 20, // 数を減らす
    sizeRange: [30, 80], // サイズを大きくする
    // ...
},
```

**例2: Accessセクションの色を青系にしたい場合**

`id: 'access-canvas'` のオブジェクトを探し、`colorPalette`の配列を青系のカラーコードに書き換えます。

```javascript
// 変更前
{
    id: 'access-canvas',
    colorPalette: [new THREE.Color(0xffffff), new THREE.Color(0xffff00), ...],
    // ...
},

// 変更後
{
    id: 'access-canvas',
    colorPalette: [new THREE.Color(0xadd8e6), new THREE.Color(0x87cefa), new THREE.Color(0x4682b4)], // LightBlue, LightSkyBlue, SteelBlue
    // ...
},
```

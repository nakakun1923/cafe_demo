# cafe&BAR Caprice

静的カフェデモサイトです。

- 公開TOP・メニュー: index.html / menu.html。以前のデザイン・写真・文章を維持しています。
- コンセプト案: concept/index.html / concept/menu.html。既存UIに、地域のいつもの居場所を目指す文章と、ランチ・店内・人が集まる写真を反映しています。
- ブラッシュアップ案: refined/index.html / refined/menu.html。コンセプト案の言葉を軸に、配色・書体・構成を作り直した案です。ひる・ごご・よるの順に一日をたどる構成で、営業時間・定休日・駐車場・電話・Instagramは refined/site-settings.js で設定できます（空欄は「準備中」と表示）。

- ブレンド案: blend/index.html / blend/menu.html。ブラッシュアップ案の構成と言葉に、公開TOPの配色（紙色・焦げ茶・金）と明朝の見出し、丸みのある部品を合わせた案です。色・影・角丸・余白は blend/tokens.css と blend/caprice-theme.css の変数で管理しています。スマホでは冒頭を過ぎると「行き方 / メニュー / Instagram」の近道が下に出ます。Instagram と Google マップのお店ページは blend/site-settings.js に設定済みです（Instagram は専用の帯・行き方の欄・近道に表示、「Google マップで開く」はお店のページを開きます）。

両案で、住所重複の解消、PCのOUR CAFE写真の左端揃え、詳細を開く写真の拡大アイコンと緩やかなズーム、モーダルのフェード表示・終了、スライダーの緩やかな切り替えに対応しています。動きを減らすOS設定を尊重します。
ヘッダーの順序・リンク先は各案で統一。メニューのみ別ページです。フッターから公開TOPとコンセプト案を行き来できます。比較案にはnoindexを設定しています。

所在地: 〒761-0613 香川県木田郡三木町上高岡２１７１。
営業時間・Instagramは未定。各案のsite-settings.jsで設定できます。
写真はAIで制作したデモ用イメージで、実店舗・スタッフ・提供メニューの写真ではありません。提供内容・価格は未確定。計測タグは未設定です。

https://nakakun1923.github.io/cafe_demo/
https://nakakun1923.github.io/cafe_demo/concept/index.html
https://nakakun1923.github.io/cafe_demo/refined/index.html
https://nakakun1923.github.io/cafe_demo/blend/index.html

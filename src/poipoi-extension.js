(async function inject() {

  if (window.extension || location.href.includes('video-tab.html'))
    return;
  window.extension = true;

  var VERSION = 93;
  var innerJSML = element => Array.from(element.childNodes).map(node => {
    if (node.tagName) {
      var attrs = {};
      for (var attr of node.attributes)
        attrs[attr.name] = attr.value;
      return [node.tagName, attrs, innerJSML(node)];
    }
    return node.nodeValue || '';
  });
  var JSML = function (parent, mode, jsml) {
    if (mode === 'clear')
      parent.textContent = '';
    if (typeof jsml === 'string')
      jsml = [jsml];
    if (jsml?.constructor !== Array)
      return;
    var document = parent.ownerDocument;
    jsml.forEach(data => {
      if (data?.constructor !== Array) {
        parent.appendChild(document.createTextNode(data));
        return;
      }
      var element = parent.appendChild(document.createElement(data[0])), childNodes;
      if (data[1]?.constructor === Object) {
        childNodes = data[2];
        for (attr in data[1]) {
          if (typeof data[1][attr] === 'string')
            element.setAttribute(attr, data[1][attr]);
          else
            element[attr] = data[1][attr];
        }
      } else {
        childNodes = data[1];
      }
      if (childNodes)
        JSML(element, 'append', childNodes);
    });
  };
  var generateConfigMenu = function () {
    return [
      {
        name: text('実験的機能', 'Experimental Config'),
        type: 'separator'
      },
      {
        key: 'numbering',
        name: text('名前に識別子を付ける', 'Add identifier to name'),
        description: text('番号や白トリップはログインするたびに変わるランダムな値のため個人の特定には利用できません。', 'The number and white trip are random values.'),
        type: [
          'OFF',
          text('名無しに番号を振る', 'Assign a number to anon'),
          text('全員に疑似白トリップを付ける', 'Add white trip')
        ],
        value: 1
      },
      {
        key: 'escape',
        name: text('キャラが重なったときに逃げる', 'Escape from overlapping'),
        type: [
          'OFF',
          text('１歩逃げる', 'Escape to a step'),
          text('遠くに逃げる', 'Escape to far away')
        ],
        value: 0
      },
      {
        key: 'confirmURLShortening',
        name: text('長いURLを貼った時に短縮するか聞く', 'Confirm URL shortening'),
        type: 'onoff',
        value: 1
      },
      {
        key: 'shortenerTimeout',
        name: text('長いURLを貼った時にURL短縮処理を待つ秒数', 'Waiting time for shortening URL (seconds)'),
        type: 'input',
        value: '3'
      },
      {
        key: 'autoComplete',
        name: text('Tabキーでメンションの名前を補完', 'Name autocomplete by Tab key'),
        description: text('IME変換中は機能しません。複数候補がいる場合はTabキーを押すたびに切り替わります。', 'When there are two or more candidates, the name is toggled each to press Tab key.'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'silence',
        name: text('iPhone接続維持用音声表示', 'Display silence audio for iPhone'),
        description: text('無音の音声ファイルを表示します。iPhoneでこの音声ファイルを再生すると接続を維持できます。', 'iPhone does not disconnect gikopoipoi on background while you play silence audio.'),
        type: 'onoff',
        value: 0
      },
      {
        name: text('見た目', 'Display'),
        type: 'separator'
      },
      {
        name: text('いらないボタン', 'Hide button'),
        description: text('設定ボタンを消した場合は#configコマンドで出せます。', 'Use #config command instead of button.'),
        type: 'title'
      },
      {
        key: 'hideVoiceButton',
        name: text('音声入力', 'Voice Input'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'hideWidgetButton',
        name: 'Widget',
        type: 'checkbox',
        value: false
      },
      {
        key: 'hideLogWindowButton',
        name: text('ログ窓', 'Log Window'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'hideClearButton',
        name: text('ログクリア', 'Clear Log'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'hideSaveButton',
        name: text('ログ保存', 'Save Log'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'hideConfigButton',
        name: text('設定', 'Config'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'hidePIP',
        name: 'PIP',
        type: 'checkbox',
        value: false
      },
      {
        key: 'vtuberNiconico',
        name: text('VTuberモードとニコ動モード', 'VTuber and Niconico mode'),
        type: [
          text('有効', 'Enable'),
          text('VTuberモードを無効化', 'Disable VTuber'),
          text('ニコ動モードを無効化', 'Disable Niconico'),
          text('両方無効', 'Disable all')
        ],
        value: 0
      },
      {
        key: 'outdoor',
        name: text('タイトルとキャラ選択とマップを消す', 'Hide gikopoipoi parts'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'displayIcon',
        name: text('ログにキャラを表示', 'Display character in log'),
        type: 'onoff',
        value: 0,
        relations: ['iconSize']
      },
      {
        key: 'iconSize',
        name: text('ログのキャラサイズ', 'Character size in log'),
        type: 'input',
        value: 25
      },
      {
        key: 'autoColor',
        name: text('自動でログを色分けする', 'Auto colored log'),
        type: 'onoff',
        value: 0,
        relations: ['autoColorList']
      },
      {
        key: 'autoColorList',
        name: text('自動ログ色リスト', 'Palette of auto colored log'),
        description: text('自動色分けで使う色をカラーコードで指定します。', 'Set hex colors for auto colored log.'),
        type: 'list',
        option: 'color',
        value: ['#ff8000', '#008000', '#0080ff', '#8060ff', '#ff60ff']
      },
      {
        name: text('名前指定系', 'Name list'),
        type: 'separator',
        description: text('両端を半角スラッシュ(/)にすると正規表現として扱われます。', 'You can set /test/ as RegExp.')
      },
      {
        key: 'ttsAllowList',
        name: text('読み上げ許可リスト', 'TTS allow list'),
        description: text('このリストが空のときは全員読み上げます。指定がある場合は許可している人以外は読み上げません。', 'If the list is empty, everyone is allowed.'),
        type: 'list',
        value: []
      },
      {
        key: 'ttsDenyList',
        name: text('読み上げ拒否リスト', 'TTS deny list'),
        type: 'list',
        value: []
      },
      {
        key: 'streamStopper',
        name: text('配信事故防止', 'Streaming stopper list'),
        description: text('ここに追加された名前の人が配信停止と発言すると自分の配信を止めることができます。', 'Listed persons can stop my streaming to say "stop streaming".'),
        type: 'list',
        value: []
      },
      {
        name: text('自動あぼーん系', 'Auto Block'),
        type: 'separator',
        description: text('両端を半角スラッシュ(/)にすると正規表現として扱われます。', 'You can set /test/ as RegExp.')
      },
      {
        key: 'filteringHelper',
        name: text('フィルタリング補助', 'Filtering Helper'),
        description: text('指定した文字を消してから自動あぼーんやNGワード判定します。例：「./ー」と指定するとア.ホ、ア/ホ、アーホが全てアホと見なされる', 'Remove set characters before filtering. (When set "/_", f/*/*/k or f_*_*_k is same as f**k.)'),
        type: 'input',
        value: ''
      },
      {
        key: 'autoBlock',
        name: text('自動相互一方あぼーん', 'Auto block'),
        description: text('名前を部分一致で指定します。例：無だけ指定すると名無しさんと無職くんをあぼーん', 'Partial Match'),
        type: 'list',
        value: []
      },
      {
        key: 'autoIgnore',
        name: text('自動一方あぼーん', 'Auto ignore'),
        type: 'list',
        value: []
      },
      {
        key: 'wordFilter',
        name: text('NGワード', 'Word filter'),
        description: text('意図しないフィルタリングで意志疎通に問題が発生する可能性があります。', 'Unintended filtering may cause communication problems.'),
        type: 'list',
        value: []
      },
      {
        key: 'wordBlock',
        name: text('NGワードを発言したら', 'Word filter penalty'),
        type: [
          text('その発言を非表示', 'Invisible message'),
          text('相互あぼーん', 'Block'),
          text('NGワードが見える相互あぼーん', 'Block and visible message'),
          text('一方あぼーん', 'Ignore')
        ],
        value: 0
      },
      {
        key: 'withoutBlockMsg',
        name: text('SYSTEMのあぼーんメッセージを非表示', 'Hide blocking message'),
        type: 'onoff',
        value: 0
      },
      {
        name: text('特殊な自動あぼーん', 'Optional auto ignore/block'),
        type: 'separator'
      },
      {
        key: 'ignoreAll',
        name: text('ホワイトリスト型自動あぼーん', 'Allowlist mode'),
        description: text('指定した名前の人以外全員あぼーんします。', 'Block or Ignore everyone without allowlist members.'),
        type: [
          'OFF',
          text('一方あぼーん', 'Auto ignore'),
          text('相互あぼーん', 'Auto block')
        ],
        value: 0,
        relations: ['unignoreList']
        
      },
      {
        key: 'unignoreList',
        name: text('ホワイトリスト', 'Allowlist'),
        type: 'list',
        value: []
      },
      {
        key: 'spammer',
        name: text('連投あぼーん', 'Spammer'),
        type: [
          'OFF',
          text('一方あぼーん', 'Auto ignore'),
          text('相互あぼーん', 'Auto block')
        ],
        value: 0,
        relations: ['minMsgInterval', 'minMsgIntervalAverage', 'displayMsgInterval', 'hideSpamAbonMsg']
      },
      {
        key: 'minMsgInterval',
        name: text('発言間隔秒数', 'Lower limit of message interval (seconds)'),
        description: text('指定した秒数以下の発言をした人を自動あぼーんします。(小数点使用可)', 'Block or ignore user below the limit.'),
        type: 'input',
        value: ''
      },
      {
        key: 'minMsgIntervalAverage',
        name: text('平均発言間隔秒数', 'Lower limit of message interval (average)'),
        description: text('1回の発言は速くないが平均的に速い人を自動あぼーんします。', 'Judge by average value.'),
        type: 'input',
        value: ''
      },
      {
        key: 'displayMsgInterval',
        name: text('発言間隔秒数と平均値をログに表示する', 'Add time of message interval to log'),
        description: text('設定値を決めるための参考として使います。1番目は発言間隔、2番目は平均値が表示されます。', 'Reference for config'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'hideSpamAbonMsg',
        name: text('連投あぼーんメッセージを非表示', 'Hide spam blocking message'),
        type: 'onoff',
        value: 0
      },
      {
        name: text('吹き出し', 'Bubble'),
        type: 'separator'
      },
      {
        key: 'clearBubble',
        name: text('自分の吹き出しを常に消す', 'Always clear my bubble'),
        type: 'onoff',
        value: 1
      },
      {
        key: 'bubblePosition',
        name: text('デフォの吹き出し位置', 'Bubble position'),
        type: [
          text('右上', 'Right-top'),
          text('右下', 'Right-bottom'),
          text('左上', 'Left-top'),
          text('左下', 'Left-bottom')
        ],
        value: 0
      },
      {
        key: 'clearBubbleAtLogin',
        name: text('入室時吹き出しを消す', 'Clear bubbles at entering room'),
        type: [
          'OFF',
          text('開発前だけ消す', 'Clear bubbles on Kanrinin street only'),
          'ON'
        ],
        value: 0
      },
      {
        key: 'bubbleFilter',
        name: text('吹き出しNGワード', 'Bubble Filter'),
        description: text('両端を半角スラッシュ(/)にすると正規表現として扱われます。', 'You can set /test/ as RegExp.'),
        type: 'list',
        value: []
      },
      {
        name: text('通知とログ', 'Notifications And Log'),
        type: 'separator'
      },
      {
        key: 'notifyStream',
        name: text('配信通知', 'Stream notification'),
        type: 'onoff',
        value: 1
      },
      {
        key: 'notifyMention',
        name: text('メンション通知', 'Mention notification'),
        type: 'onoff',
        value: 1,
        relations: ['replyMsg', 'mentionSound', 'mentionVolume']
      },
      {
        key: 'replyMsg',
        name: text('メンション通知をクリックした時返答する言葉', 'Message at clicking mention notification'),
        type: 'input',
        value: ''
      },
      {
        key: 'mentionSound',
        name: text('メンションが来たときに再生する音声ファイルのData URL', 'Mention Sound Data URL'),
        description: text('本家でも音を鳴らす設定にしている場合は２つ同時に鳴ります。', 'If you enable mention sound on poipoi and this extension, two sounds are played.'),
        type: 'input',
        value: ''
      },
      {
        key: 'mentionVolume',
        name: text('メンションが来たときに再生する音の大きさ', 'Mention Sound Volume'),
        description: text('0～1の実数で指定', 'between 0 and 1'),
        type: 'input',
        value: ''
      },
      {
        key: 'notifyAccess',
        name: text('入退室通知', 'Enter and Exit notifications'),
        type: [
          'OFF',
          text('アクティブ時のみ', 'Active'),
          text('非アクティブ時のみ', 'Inactive'),
          text('常に通知', 'Always')
        ],
        value: 0
      },
      {
        key: 'accessLog',
        name: text('入退室ログ', 'Log enter and exit'),
        type: [
          'OFF',
          'ON',
          text('IDも出力', 'Output with ID')
        ],
        value: 0
      },
      {
        key: 'withoutAnon',
        name: text('入退室通知とログで名無しを除外', 'Enter and exit log without anon'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'logRoomName',
        name: text('部屋名をログに記録する', 'Log room name'),
        type: 'onoff',
        value: 0
      },
      {
        name: 'Widget',
        type: 'separator'
      },
      {
        name: text('表示する内容', 'Display'),
        type: 'title'
      },
      {
        key: 'widgetStreaming',
        name: text('配信開始', 'Start streaming'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'widgetMention',
        name: text('メンション', 'Mention'),
        type: 'checkbox',
        value: false
      },
      {
        key: 'widgetAccess',
        name: text('入退室', 'Enter and Exit'),
        type: 'checkbox',
        value: true
      },
      {
        key: 'widgetAnonAccess',
        name: text('名無しの入退室', 'Anon enter and exit'),
        type: 'checkbox',
        value: true
      },
      {
        key: 'widgetComment',
        name: text('発言', 'Comment'),
        type: 'checkbox',
        value: true
      },
      {
        key: 'widgetAnonComment',
        name: text('名無しの発言', 'Anon Comment'),
        type: 'checkbox',
        value: true
      },
      {
        key: 'widgetLength',
        name: text('最大行数', 'Length'),
        type: 'input',
        value: '30'
      },
      {
        key: 'widgetWidth',
        name: text('横幅', 'Width'),
        type: 'input',
        value: '250'
      },
      {
        key: 'widgetHeight',
        name: text('高さ', 'Height'),
        type: 'input',
        value: '500'
      },
      {
        key: 'widgetFps',
        name: 'fps',
        type: 'input',
        value: '2'
      },
      {
        key: 'widgetCSS',
        name: 'CSS',
        type: 'textarea',
        description: `Sample HTML
  <div class="log">
  <p class="streaming"><span class="name">test</span><span class="ihash">◇AAAAAA</span><span class="content"> has started streaming.</span></p>
  <p class="access"><span class="name">test</span><span class="ihash">◇AAAAAA</span><span class="content"> has joined the room.</span></p>
  <p class="comment anon"><span class="name">Anonymous</span><span class="ihash">◇AAAAAA</span><span class="separator">: </span><span class="content">test</span></p>
  <p class="comment mention"><span class="name"></span><span class="ihash">◇AAAAAA</span><span class="trip">◆AAAAAAAAAA</span><span class="separator">: </span><span class="content">hi test</span></p>
  </div>`,
        value: 'body{margin:0;padding:0;width:100%;height:100%;border:1px solid #000;box-sizing:border-box;background:#fff}.log{position:fixed;bottom:1px;width:100%}p{margin:0;padding:2px;font-size:0.8em;border-top:1px solid #000;word-break:break-all}.ihash{display:none}'
      },
      {
        name: text('コントローラー (ゲームパッド)', 'Gamepad'),
        type: 'separator'
      },
      {
        key: 'enableGamepad',
        name: text('ゲームパッドを有効にする', 'Enable gamepad'),
        type: 'onoff',
        value: 1,
        relations: ['enableVibration', 'swapGamepadButton', 'gamepadDeadzone', 'gamepadLayout']
      },
      {
        key: 'enableVibration',
        name: text('振動を有効にする', 'Enable vibration'),
        type: 'onoff',
        value: 1
      },
      {
        key: 'swapGamepadButton',
        name: text('決定ボタンとキャンセルボタンを入れ替える', 'Swap OK with Cancel'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'gamepadDeadzone',
        name: text('アナログスティックのデッドゾーン (0.0～1.0)', 'Stick dead zone (0.0～1.0)'),
        type: 'input',
        value: '0.5'
      },
      {
        key: 'gamepadLayout',
        name: text('ボタン配置', 'Gamepad layout'),
        description: text('ボタンを長押しすると対応した箇所の色が変わります。 (現在使えるコマンド：cancel, ok, rula, mic, recieve, list, stream, henshin, up, down, left, right)', 'Press and hold to change color. (Available commands: cancel, ok, rula, mic, recieve, list, stream, henshin, up, down, left, right)'),
        type: 'list',
        option: 'layout',
        value: [
          'cancel',
          'ok',
          'rula',
          'mic',
          'recieve',
          'list',
          'stream',
          'henshin',
          '',
          '',
          '',
          '',
          'up',
          'down',
          'left',
          'right'
        ]
      },
      {
        name: text('その他', 'Others'),
        type: 'separator'
      },
      {
        key: 'takeStreamImmediately',
        name: text('入室時に自動で受信ボタンを押す', 'Press the button to get stream at entering'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'hairControl',
        name: text('内藤の髪', "Naito's hair"),
        type: [
          text('通常', 'Normal'),
          text('絶対に生えない', 'Absolutely no hair'),
          text('絶対に生える', 'Hair always exists')
        ],
        value: 0
      },
      {
        key: 'henshin',
        name: text('最初から#henshinする', 'Henshin at login'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'disableMove',
        name: text('ダブルクリック移動を無効化', 'Disable double click moving'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'stopBack',
        name: text('ブラウザバックを禁止する', 'Stop backward'),
        type: 'onoff',
        value: 0
      },
      {
        key: 'errorLog',
        name: text('エラーログを保持する行数', 'Lines of saving error log'),
        type: 'input',
        value: '3'
      },
      {
        key: 'useCookie',
        name: text('設定の保存場所', 'Config data location'),
        type: [
          'Local Storage',
          'Cookie'
        ],
        value: 0
      },
      {
        key: 'roomColor',
        name: 'Room background CSS <color> value',
        type: 'input',
        value: ''
      },
      {
        key: 'brightness',
        name: 'Brightness of room',
        type: 'input',
        value: ''
      },
      {
        key: 'userCSS',
        name: 'User CSS',
        type: 'textarea',
        value: ''
      },
      {
        key: 'logWindowCSS',
        name: 'Log window CSS',
        type: 'textarea',
        value: '.message {\n  padding: 2px 0;\n  border-bottom: 1px solid #000;\n}'
      },
      {
        key: 'voiceLog',
        name: 'Voice input',
        type: [
          'Send',
          'Output to log'
        ],
        value: 0
      },
      {
        key: 'voiceLang',
        name: 'Voice input language code',
        type: 'input',
        value: ''
      },
      {
        key: 'voiceFormatGen',
        name: 'Voice input format in _gen',
        type: 'input',
        value: '音声入力:message'
      },
      {
        key: 'voiceFormatFor',
        name: 'Voice input format in _for',
        type: 'input',
        value: 'Voice input:message'
      },
      {
        key: 'disablePixelRatio',
        name: 'Disable calc pixel ratio',
        type: 'onoff',
        value: 0
      },
      {
        key: 'showColorPicker',
        name: 'Show color picker',
        type: 'onoff',
        value: 0
      }
    ];
  };
  var writeConfigHTML = function (document, title, langCode, configMenu, experimentalConfig) {
    var configScript = function (langCode, configMenu, experimentalConfig) {
      window.extension = true;
      var text = function () {return arguments[langCode]};
      var currentValue = {};
      var setOptions = (select, values, opt, index = null) => {
        if (index === null)
          select.textContent = '';
        values?.forEach?.(value => {
          var option = document.createElement('option');
          select.add(option, index);
          option.text = value;
          if (opt === 'color') {
            option.style.color = value;
            option.style.fontWeight = 'bold';
          }
        });
        return values;
      };
      window.load = function (obj) {
        try {
          if (typeof obj === 'string')
            obj = JSON.parse(obj);
        } catch (err) {
          alert(err);
        }
        configMenu.forEach(item => {
          if (!obj.hasOwnProperty(item.key))
            return;
          var element = document.getElementById(item.key), value = obj[item.key];
          switch (item.type) {
            case 'checkbox':
              element.checked = value;
              break;
            case 'textarea':
            case 'input':
              element.value = value;
              break;
            case 'list':
              setOptions(element, value, item.option);
              break;
            default:
              if (item.type?.constructor === Array) {
                element.selectedIndex = value;
                element.onchange?.();
              }
          }
        });
        Object.assign(currentValue, obj);
      };
      var update = function (key, value) {
        if (key)
          currentValue[key] = value;
        if (window.opener) {
          try {
            opener.modifyConfig(currentValue);
          } catch (err) {
            alert(text('設定の適用に失敗しました。ギコっぽいぽいを開きなおしてください。', 'Failed to save config. Open gikopoipoi again.'));
          }
        } else {
          console.log(currentValue);
        }
      };
      var downloadLink = document.createElement('a'), file = document.createElement('input'), reader = new FileReader();
      file.type = 'file';
      file.accept = '.json';
      file.onchange = function () {
        reader.readAsText(file.files[0]);
        file.value = '';
      };
      reader.onload = function () {
        load(reader.result);
        update();
      };
      var divs = {};
      var append = function (tagName, group, attr) {
        var parent = document.body;
        if (typeof group === 'string') {
          parent = divs[group] || (divs[group] = append('div'));
        } else {
          attr = group;
        }
        var element = parent.appendChild(document.createElement(tagName));
        Object.assign(element, attr);
        return element;
      };
      var fileMenu = append('select');
      fileMenu.appendChild(document.createElement('option')).text = text('設定ファイル', 'Config file');
      fileMenu.appendChild(document.createElement('option')).text = text('開く...', 'Load...');
      fileMenu.appendChild(document.createElement('option')).text = text('保存...', 'Save...');
      fileMenu.selectedIndex = 0;
      fileMenu.onchange = function () {
        switch (fileMenu.selectedIndex) {
          case 1:
            file.click();
            break;
          case 2:
            URL.revokeObjectURL(downloadLink.href);
            downloadLink.href = URL.createObjectURL(new Blob([JSON.stringify(currentValue, null, 2) + '\n'], {type: 'application/octet-stream'}));
            downloadLink.download = 'experimental-poipoi-config.json';
            downloadLink.click();
            break;
        }
        fileMenu.selectedIndex = 0;
      };
      append('input', {
        type: 'button',
        value: text('設定ページを閉じる', 'Close this page'),
        onclick: function () {
          close();
        }
      }).style.marginLeft = '5em';
      var defaultValue = {};
      configMenu.forEach(item => {
        switch (item.type) {
          case 'separator':
            append('hr');
            append('h1', {
              textContent: item.name,
              onclick: function () {
                var element = this.nextElementSibling;
                while (element && element.tagName !== 'HR') {
                  element.style.display = element.style.display ? '' : 'none';
                  element = element.nextElementSibling;
                }
              }
            });
            if (item.description)
              append('p').innerText = item.description;
            return;
          case 'title':
            append('h2').textContent = item.name;
            if (item.description)
              append('p').innerText = item.description;
            return;
          case 'button':
            append('button', item);
            return;
          case 'checkbox':
            append('label').append(
              append('input',{
                id: item.key,
                type: 'checkbox',
                checked: item.value,
                onchange: function () {
                  update(item.key, this.checked);
                }
              }),
              item.name
            );
            break;
          case 'textarea':
          case 'input':
            append('h2', item.key).textContent = item.name;
            if (item.description)
              append('p', item.key).innerText = item.description;
            var input = append(item.type, item.key, {id: item.key, spellcheck: false});
            if (item.type === 'input') {
              input.type = 'text';
              input.style.width = '30em';
            } else {
              input.setAttribute('style', 'width:50em;height:8em');
            }
            append('input', item.key, {
              type: 'button',
              value: 'Apply',
              onclick: function () {
                update(item.key, input.value);
              }
            });
            append('input', item.key, {
              type: 'button',
              value: 'Reset',
              onclick: function () {
                if (confirm(text('初期値に戻しますか？', 'Do you set default value?')))
                  update(item.key, input.value = item.value);
              }
            });
            break;
          case 'list':
            append('h2', item.key).textContent = item.name;
            if (item.description)
              append('p', item.key).innerText = item.description;
            var addText = append('input', item.key, {
              type: 'text',
              onkeypress: function (event) {
                if (event.key === 'Enter')
                  addButton.click();
              }
            });
            addText.setAttribute('style', 'width:20em;box-sizing:border-box');
            var addButton = append('input', item.key, {
              type: 'button',
              value: 'Add',
              onclick: function () {
                if (!addText.value)
                  return;
                if (/^\/.+\/([dgimsuy]*)$/i.test(addText.value)) {
                  try {
                    new RegExp(addText.value.slice(1, -(1 + RegExp.$1.length)), RegExp.$1);
                  } catch (err) {
                    alert(text('正規表現の書き方が違う:', '') + err);
                    return;
                  }
                }
                setOptions(select, [addText.value], item.option, select.selectedIndex === -1 ? 0 : select.selectedIndex);
                addText.value = '';
                update(item.key, Array.from(select.options).map(option => option.text));
              }
            });
            append('br', item.key);
            var select = append('select', item.key, {
              id: item.key,
              size: item.option === 'layout' ? 16 : 6
            });
            if (item.option)
              select.className = item.option;
            select.setAttribute('style', 'width:20em;box-sizing:border-box');
            append('input', item.key, {
              type: 'button',
              value: 'Delete',
              onclick: function () {
                var i = select.selectedIndex;
                select.remove(i);
                select.selectedIndex = Math.min(i, select.options.length - 1);
                update(item.key, Array.from(select.options).map(option => option.text));
              }
            });
            if (item.option)
              append('input', item.key, {
                type: 'button',
                value: 'Reset',
                onclick: function () {
                  if (confirm(text('初期値に戻しますか？', 'Do you set default value?')))
                    update(item.key, setOptions(select, item.value, item.option));
                }
              });
            break;
          case 'onoff':
            item.type = ['OFF', 'ON'];
          default:
            if (item.type?.constructor !== Array)
              break;
            append('h2', item.key).textContent = item.name;
            if (item.description)
              append('p', item.key).innerText = item.description;
            var changeStyle = () => {
              select.style.backgroundColor = {ON: '#afa', OFF: '#faa'}[select.value] || '';
              if (item.relations)
                item.relations.forEach(id => document.getElementById(id).parentNode.className = select.value === 'OFF' ? 'hide' : '');
            };
            var select = append('select', item.key, {
              id: item.key,
              onchange: function (event) {
                if (event)
                  update(item.key, select.selectedIndex);
                changeStyle();
              }
            });
            item.type?.forEach?.(option => select.appendChild(document.createElement('option')).text = option);
            queueMicrotask(changeStyle);
            break;
        }
        defaultValue[item.key] = item.value;
      });
      load(defaultValue);
      Array.from(document.getElementsByTagName('h1')).forEach(h1 => h1.click());
      load(experimentalConfig);
      setInterval(() => {
        var layout = document.querySelector('.layout');
        navigator.getGamepads().reduce((accumulator, gp) => gp?.buttons.forEach((b, i) => accumulator[i] ||= b.pressed) || accumulator, []).forEach((pressed, i) => {
          if (layout.options[i] && (layout.options[i].className === 'pressed') !== pressed)
            layout.options[i].className = pressed ? 'pressed' : '';
        });
      }, 1000);
    };
    JSML(document.documentElement, 'clear', [
      ['head', [
        ['title', title],
        ['meta', {name: 'viewport', content: 'width=device-width, initial-scale=1.0'}],
        ['style', `
          h1{
            color: #06f;
            cursor: pointer;
            text-decoration: underline;
            margin: 0;
            padding: 10px 0;
          }
          .hide{
            display:none;
          }
          label{
            padding: 10px;
            display: inline-block;
          }
          input[type=button]{
            padding-left: 30px;
            padding-right: 30px;
          }
          select.layout option:first-child{
            counter-reset: number -1;
          }
          select.layout option:before{
            counter-increment: number;
            content:counter(number) ". ";
          }
          option.pressed{
            background-color: #afa;
          }
        `]
      ]],
      ['body']
    ]);
    document.defaultView.args = JSON.stringify([langCode, configMenu, experimentalConfig]);
    JSML(document.head, 'append', [
      ['script', `(${configScript})(...JSON.parse(args))`]
    ]);
  };
  var writeChessHTML = function (document, title, fens, linkText) {
    var chessScript = function (fens) {
      var fenToData = function (fen) {
        if (!fen)
          return;
        try {
          var fields = fen.split(' ');
          return {
            place: fields[0].replace(/[1-8]/g, n => ' '.repeat(n)).split('/'),
            color: fields[1],
            fullMoveNumber: +fields[5]
          };
        } catch (err) {
          throw new Error('Wrong fen:' + fen + '\nError:' + err);
        }
      };
      var fenToPgn = function (fens) {
        if (fens?.constructor !== Array)
          throw new Error('fens is not Array');
        if (fens.length < 2)
          return '';
        var pgn = fens[0] === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' ? '' : `[SetUp "1"]\n[FEN "${fens[0]}"]\n`;
        var previous = fenToData(fens.shift()), current;
        pgn += previous.fullMoveNumber + '.' + (previous.color === 'b' ? '.. ' : '');
        while (current = fenToData(fens.shift())) {
          var removes = {}, adds = {};
          for (var r = 0; r < 8; r++) {
            for (var f = 0; f < 8; f++) {
              if (previous.place[r][f] === current.place[r][f])
                continue;
              if (previous.place[r][f] !== ' ')
                removes[previous.place[r][f]] = {r, f};
              if (current.place[r][f] !== ' ')
                adds[current.place[r][f]] = {r, f};
            }
          }
          var pieces = Object.keys(adds), pieceName = pieces[0].toUpperCase(), capture = Object.keys(removes).length === 2;
          if (pieces.length === 2) {
            pgn += 'O-O' + ((adds['k'] || adds['K']).f === 2 ? '-O' : '');
          } else {
            var to;
            if (pieceName === 'P' || !removes[pieces[0]]) {
              to = capture ? 'abcdefgh'[(removes[pieces[0]] || removes[previous.color === 'w' ? 'P': 'p']).f] : '';
            } else {
              to = pieceName + 'abcdefgh'[removes[pieces[0]].f] + '87654321'[removes[pieces[0]].r];
            }
            pgn += to + (capture ? 'x' : '') + 'abcdefgh'[adds[pieces[0]].f] + '87654321'[adds[pieces[0]].r] + (removes[pieces[0]] ? '' : '=' + pieceName);
          }
          pgn += previous.fullMoveNumber === current.fullMoveNumber ? ' ' : '\n' + (fens.length ? current.fullMoveNumber + '.' : '');
          previous = current;
        }
        return pgn;
      };
      document.body.appendChild(document.createElement('pre')).textContent = fenToPgn(fens);
    };
    JSML(document.documentElement, 'clear', [
      ['head', [
        ['title', title]
      ]],
      ['body', [
        ['p', [
          ['a', {href: 'https://www.chesscompass.com/analyze', target: '_blank'}, linkText]
        ]],
      ]]
    ]);
    document.defaultView.args = JSON.stringify([fens]);
    JSML(document.head, 'append', [
      ['script', `(${chessScript})(...JSON.parse(args));`]
    ]);
  };
  var writeLogWindowHTML = function (document, title, colorStyleJSML, disconnectMessage) {
    var logWindowScript = function (disconnectMessage) {
      window.extension = true;
      window.interval = setInterval(function () {
        try {
          if (opener.logWindow !== window)
            throw 1;
        } catch (err) {
          document.title = disconnectMessage;
          clearInterval(interval);
        }
      }, 10000);
      document.addEventListener('click', function (event) {
        if (event.target.tagName === 'A' && event.target.dataset.room) {
          _vueApp.changeRoom(event.target.dataset.room);
          event.preventDefault();
        }
      });
    };
    JSML(document.documentElement, 'clear', [
      ['head', [
        ['title', title],
        ['meta', {name: 'viewport', content: 'width=device-width, initial-scale=1.0'}],
        ['style', `html,body{margin:0;padding:0;box-sizing:border-box;width:100%;height:100%}
body{display:flex;flex-direction:column}
#chatLog{overflow:auto;word-break:break-all;flex-grow:1}
input{font-size:16px}
.message-timestamp,.ignored-message{display:none}
.inactive-message:before{opacity:0.5}`],
        ['style', {id: 'log-style'}],
        ...colorStyleJSML
      ]],
      ['body', [
        ['input', {type: 'text', id: 'input-textbox'}]
      ]]
    ]);
    document.defaultView.args = JSON.stringify([disconnectMessage]);
    JSML(document.head, 'append', [
      ['script', `(${logWindowScript})(...JSON.parse(args));`]
    ]);
  };

  var disableButtonContainer = document.createElement('div');
  disableButtonContainer.id = 'disableButtonContainer';
  disableButtonContainer.setAttribute('style', 'position:absolute;top:0;right:20px;z-index:10000');
  document.body.insertBefore(disableButtonContainer, document.body.firstChild);
  var disableButton = document.createElement('button');
  disableButtonContainer.append(disableButton);
  var contactButton = document.createElement('button');
  disableButtonContainer.append(contactButton);
  contactButton.textContent = '問い合わせ Contact';
  contactButton.onclick = () => open('https://form1ssl.fc2.com/form/?id=019f176bae31cba6', '_blank', 'noreferrer');
  if (+localStorage.getItem('experimentalVersion') < VERSION) {
    localStorage.removeItem('disableScript');
    var changelogButton = document.createElement('button');
    disableButtonContainer.append(changelogButton);
    changelogButton.textContent = '新機能 Whats new';
    changelogButton.style.backgroundColor = '#c88';
    changelogButton.onclick = () => {
      open('https://iwamizawa-software.github.io/poipoi-extension/changelog.txt', '_blank', 'noreferrer');
      localStorage.setItem('experimentalVersion', VERSION);
    };
  }
  var downloadLink = document.createElement('a');
  var downloadText = (text, fname) => {
    URL.revokeObjectURL(downloadLink.href);
    downloadLink.href = URL.createObjectURL(new Blob([text], {type: 'application/octet-stream'}));
    downloadLink.download = fname;
    downloadLink.click();
  };
  var errorLog = JSON.parse(localStorage.getItem('experimentalErrorLog')) || [];
  var downloadErrorLog = () => downloadText(JSON.stringify(errorLog), 'error-log.txt');
  if (localStorage.getItem('disableScript')) {
    disableButton.textContent = '拡張機能を有効化 Enable extension';
    disableButton.style.background = '#5f5';
    disableButton.onclick = () => {
      localStorage.removeItem('disableScript');
      location.reload();
    };
    var resetButton = document.createElement('button');
    resetButton.textContent = 'リセット Reset';
    resetButton.onclick = () => {
      if (confirm('拡張機能の設定をリセットしますか？ Do you clear config of extension?')) {
        localStorage.removeItem('experimentalConfig');
        alert('リセットしました Done');
        disableButton.click();
      }
    };
    disableButton.after(resetButton);
    var errorLogButton = document.createElement('button');
    errorLogButton.textContent = 'エラーログ Error Log';
    errorLogButton.onclick = downloadErrorLog;
    resetButton.after(errorLogButton);
    return;
  } else {
    disableButton.textContent = 'バグったら押す Disable extension';
    disableButton.onclick = () => {
      localStorage.setItem('disableScript', 'true');
      localStorage.setItem('experimentalVersion', VERSION);
      alert('拡張機能が無効になりました。\nこれで治った場合拡張機能のバグなので報告お願いします。\nExtension has been disabled.');
      location.reload();
    };
  }
  var consolelog = function () {
    try {
      var log = Array.from(arguments)
        .filter(err => err && !(err.constructor === Event && err.type === 'error' && err.target === null))
        .map(err => err.stack ? err.message + '\n' + err.stack : err).join('\n');
      if (!log)
        return;
      console.log(log);
      errorLog.push({
        date: (new Date()).toLocaleString(),
        room: vueApp.currentRoom?.id,
        users: Object.values(vueApp.users || {}).map(({id, name, character, message}) => [id, character?.characterName, name, message].filter(Boolean)),
        log
      });
      if (+experimentalConfig.errorLog)
        localStorage.setItem('experimentalErrorLog', JSON.stringify(errorLog.slice(-experimentalConfig.errorLog)));
    } catch (err) {
      console.log(err);
    }
  };
  window.onunhandledrejection = event => { consolelog(event.reason);};
  Object.defineProperty(console, 'error', {
    set: function () {},
    get: () => consolelog
  });
  var ready = async function (obj, key) {
    if (obj[key])
      return obj[key];
    var value, callback;
    Object.defineProperty(obj, key, {
      set: v => {
        if (value = v) {
          console.log(key + ' is ready');
          callback(value);
        }
      },
      get: () => value
    });
    return {then: c=>{callback = c}};
  };
  var sleep = t => ({then: f => setTimeout(f, t)});
  var getObjectAsync = async function (obj, key) {
    while (!obj[key])
      await sleep(1000);
    return obj[key];
  };
  var observedSelectors = [];
  var observer = new MutationObserver(() => {
    observedSelectors = observedSelectors.filter(obj => {
      var element = document.querySelector(obj.selector);
      if (element)
        obj.resolve(element);
      else
        return true;
    });
    if (!observedSelectors.length)
      observer.disconnect();
  });
  var querySelectorAsync = async selector => document.querySelector(selector) || new Promise(resolve => {
    if (!observedSelectors.length)
      observer.observe(document.body, {subtree: true, childList: true});
    observedSelectors.push({selector, resolve});
  });
  // PIP
  if (HTMLVideoElement.prototype.requestPictureInPicture) {
    querySelectorAsync('#video-streams').then(element => {
      var observer = new MutationObserver(() => {
        Array.from(element.querySelectorAll('.stream-buttons')).forEach(div => {
          var experimentalButtons = Array.from(div.querySelectorAll('.experimental-buttons'));
          if (div.querySelector('[id^=drop-stream-button]') && div.parentNode.querySelector('[id^=video-container]')?.style.display === '') {
            if (!experimentalButtons.length) {
              var pipButton = document.createElement('button');
              pipButton.className = 'experimental-buttons';
              pipButton.textContent = 'PIP';
              pipButton.onclick = () => {
                var video = div.parentNode.querySelector('[id^=received-video]');
                if (video) {
                  video.onpause = video.play;
                  video.requestPictureInPicture().catch(async err => {
                    if (err.name === 'NotSupportedError') {
                      if (navigator.userAgent?.includes('Android')) {
                        await asyncAlert(text('全画面表示になったら画面下から上にスワイプし、ホームボタンを押してください', 'Press home button after fullscreen'));
                        video.requestFullscreen();
                      } else {
                        experimentalConfig.hidePIP = experimentalConfig.hideWidgetButton = true;
                        modifyConfig(experimentalConfig, true);
                      }
                    }
                  });
                }
              }
              div.insertBefore(pipButton, div.firstChild);
            }
          } else {
            experimentalButtons.forEach(button => button.remove());
          }
        });
      });
      observer.observe(element, {subtree: true, childList: true});
    });
  }
  var abonQueue = [];
  var abon = async function (id) {
    abonQueue.push(id);
    if (abonQueue.length > 1)
      return;
    while (abonQueue.length) {
      (await getObjectAsync(vueApp, 'socket')).emit('user-block', abonQueue[0]);
      await sleep(100);
      abonQueue.shift();
    }
  };
  // ルーラリンク
  var roomNameToKey = {}, roomNameRegex = /0^/;
  var createRoomNameRegex = function () {
    Object.keys(vueApp.$i18next.options.resources.en.common.room).forEach(key => {
      var nihongo = vueApp.$i18next.options.resources.ja.common.room[key] || key;
      var roomName = (nihongo?.t || nihongo).split(' ');
      if (roomName[1] && roomName[0])
        roomNameToKey[roomName[0] + ' ' + roomName[1]] = key;
      roomNameToKey[roomName = roomName[1] || roomName[0]] = key;
      var halfSize = roomName.replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt() - (0xFF01 - 0x21)));
      roomNameToKey[key] = roomNameToKey[halfSize] = roomNameToKey[halfSize.toLowerCase()] = roomNameToKey[roomName.toLowerCase()] = key;
    });
    roomNameToKey['開発前'] = 'admin_st';
    roomNameRegex = new RegExp('(^|じゃ|[ 　「])(' + Object.keys(roomNameToKey).sort((a, b) => b.length - a.length).join('|') + ')(で$|$|に?(?:来|集|きて|こい|行|[居い][るた])|にて|[ 　」])');
  };
  var applyRulaLink = element => {
    Array.from(element.children).forEach(applyRulaLink);
    Array.from(element.childNodes).forEach(node => {
      var m = node.nodeValue?.match(roomNameRegex);
      if (!m)
        return;
      var a = document.createElement('a');
      a.text = m[2];
      a.href = `javascript:void%200`;
      a.dataset.room = roomNameToKey[a.text];
      var texts = node.nodeValue.split(a.text);
      element.replaceChild(a, node);
      a.before(texts.shift());
      a.after(texts.join(a.text));
    });
  };
  document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.dataset.room) {
      _vueApp.changeRoom(event.target.dataset.room);
      event.preventDefault();
    }
  });

  var vueApp = window._vueApp = await ready(await ready(await ready(await ready(await ready(window, 'vueApp'), '_container'), '_vnode'), 'component'), 'proxy');
  vueApp.toDisplayName = name => name || vueApp.$i18next.t('default_user_name');
  var room = vueApp.$i18next.options.resources.ja.common.room;
  createRoomNameRegex();
  var characterIconData = {};
  querySelectorAsync('#login-button').then(loginButton => {
    var select = document.createElement('select');
    Object.keys(vueApp.$i18next.options.resources.en.common.room).map(key => {
      var nihongo = vueApp.$i18next.options.resources.ja.common.room[key];
      return {
        value: key,
        text: (nihongo?.t || nihongo) + ' - ' + vueApp.$i18next.options.resources.en.common.room[key],
        reading: nihongo?.sort_key || nihongo
      };
    }).sort((a, b) => a.reading > b.reading ? 1 : -1).forEach(({value, text}) => {
      var option = select.appendChild(document.createElement('option'));
      option.value = value;
      option.text = text;
    });
    select.value = (new URL(location.href)).searchParams.get('roomid') || 'admin_st';
    document.getElementById('area-selection').onchange = select.onchange = () => {
      history.replaceState(null, '', '?areaid=' + (document.getElementById('gen-selection')?.checked ? 'gen' : 'for') + '&roomid=' + select.value);
    };
    select.style.display = 'block';
    loginButton.before(select);
    Array.from(document.querySelectorAll('#character-selection label img')).forEach(img => {
      var name = img.previousElementSibling.value;
      characterIconData[name] = {
        type: img.src.slice(-4),
        x: +img.style.left.slice(0, -1),
        y: +img.style.top.slice(0, -1),
        width: +img.style.width.slice(0, -1)
      };
      characterIconData[name + '_alt'] = Object.assign({}, characterIconData[name]);
    });
  });

  var silenceAudio = new Audio();
  silenceAudio.id = 'silence';
  silenceAudio.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxHYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxLEAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  silenceAudio.loop = silenceAudio.controls = true;
  silenceAudio.setAttribute('style', 'position:fixed;bottom:0;right:0');
  document.body.append(silenceAudio);
  document.head.appendChild(document.createElement('style')).textContent = '#main-section{padding-bottom:20px}';
  document.addEventListener('beforeunload', () => silenceAudio.stop());

  if (localStorage.getItem('isInfoboxVisible') === null)
    vueApp.toggleInfobox();

  var text = (_gen, _for) => vueApp.areaId === 'gen' ? _gen : _for;
  var systemMessage = msg => vueApp.writeMessageToLog('SYSTEM', msg, null);
  var sendMessage = function (msg, silent) {
    vueApp.socket.emit('user-msg', msg);
    if (experimentalConfig.clearBubble || silent)
      vueApp.socket.emit('user-msg', '');
  };
  // Mozilla 誤検出対策
  var asyncAlert = text => new Promise(resolve => vueApp['openDialog'](text, '', ['OK'], 0, resolve));
  var asyncConfirm = t => new Promise(resolve => vueApp.confirm(t, () => resolve(true), () => resolve(false)));
  var createButtonContainer = function () {
    var fakePopup = document.createElement('div');
    fakePopup.className = 'popup';
    fakePopup.style.all = 'unset';
    return fakePopup;
  };
  var toIHash = id => '◇' + btoa(id.replace(/-/g, '').replace(/../g, function (s) {return String.fromCharCode('0x' + s)})).slice(0, 6);
  var addIHash = (name, id) => experimentalConfig.numbering === 2 ? name.replace(/(◆.+)?$/, toIHash(id) + '$1') : name;
  var removeSpace = str => str.replace(/[\u{0000}\u{0009}-\u{000D}\u{0020}\u{0085}\u{00A0}\u{00AD}\u{034F}\u{061C}\u{070F}\u{115F}\u{1160}\u{1680}\u{17B4}\u{17B5}\u{180E}\u{2000}-\u{200F}\u{2028}-\u{202F}\u{205F}-\u{206F}\u{2800}\u{3000}\u{3164}\u{FEFF}\u{FFA0}\u{110B1}\u{1BCA0}-\u{1BCA3}\u{1D159}\u{1D173}-\u{1D17A}\u{E0000}-\u{E0FFF}]/gu, '');
  var match = (str, cond, removeWorkaround) => {
    if (!cond || cond.constructor !== Array || typeof str !== 'string')
      return false;
    var targets = [];
    var nospace = removeSpace(str);
    if (nospace !== str)
      targets.push(nospace);
    if (removeWorkaround) {
      var removed = nospace.split('').filter(c => !removeWorkaround.includes(c)).join('');
      if (removed !== nospace)
        targets.push(removed);
    }
    targets.push(str);
    return cond.some(c => {
      if (!c)
        return false;
      if (/^\/.+\/([dgimsuy]*)$/i.test(c)) {
        var regex = new RegExp(c.slice(1, -(1 + RegExp.$1.length)), RegExp.$1);
        return targets.some(target => regex.test(target));
      } else {
        return targets.some(target => target.includes(c));
      }
    });
  };
  // キャラ付ログ
  var characterLogCSS = document.createElement('style');
  characterLogCSS.textContent = ':root{--characterlog-size:25px}.message:not(.system-message):before{content: "";width:var(--characterlog-size);height:var(--characterlog-size);display:inline-block;background-size:contain;background-repeat:no-repeat;vertical-align:bottom;margin-right:5px}';
  document.head.append(characterLogCSS);
  var loadCharacterIcon = function (name, notAlt) {
    var data = characterIconData[name] || (characterIconData[name] = {type: '.svg', x: -50, y: 24, width: 190});
    if (data.loaded)
      return;
    data.loaded = true;
    var img = new Image();
    img.src = '/characters/' + name.replace(/_alt$/, '') + '/front-standing' + (!notAlt && name.endsWith('_alt') ? '-alt' : '') + data.type;
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 120;
      var ctx = canvas.getContext('2d');
      var ratio = data.width * 1.2 / this.width;
      ctx.drawImage(this, data.x * 1.2, data.y * 1.2, this.width * ratio, this.height * ratio);
      characterLogCSS.textContent += `[data-character-id=${name}]:before{background-image:url(${canvas.toDataURL()});}`;
      logWindow?.onstorage?.();
    };
    if (!notAlt)
      img.onerror = function () {
        data.loaded = false;
        loadCharacterIcon(name, true);
      };
  };
  // Gamepad
  var gamepad = (function () {
    var gamepads = [], enabled;
    var lastVibrate = 0;
    var self = {
      settings: {
        buttonRepeatDelay: 500,
        buttonRepeatRate: 100,
        repeatable: [12, 13, 14, 15],
        deadzone: 0.5,
        axisRepeatRate: 50,
        vibrationRate: 1000,
        repeatableAxes: [0]
      },
      enable: value => {
        if (enabled = value)
          startLoop();
        else
          stopLoop();
      },
      vibrate: () => {
        if (!enabled || self.settings.disableVibration)
          return;
        var t = performance.now();
        if (t - lastVibrate < self.settings.vibrationRate)
          return;
        lastVibrate = t;
        try{
          gamepads.forEach(gp => {
            if (!gp?.connected)
              return;
            if (gp.hapticActuators)
              gp.hapticActuators.forEach(a => a.pulse?.(0.5, 10));
            else
              gp.vibrationActuator?.playEffect?.('dual-rumble', {
                startDelay: 0,
                duration: 100,
                strongMagnitude: 0.5,
              });
          });
        } catch (err) {
          consolelog(err);
        }
      }
    };
    var gamepadsStatus = {};
    var requestId, startLoop = () => {
      cancelAnimationFrame(requestId);
      requestId = requestAnimationFrame(function f(t) {
        if ((gamepads = navigator.getGamepads()).map((gp, gamepadIndex) => {
          if (!gp)
            return;
          if (!gp.connected) {
            delete gamepads[gamepadIndex];
            return;
          }
          var buttonsStatus = (gamepadsStatus[gamepadIndex] || (gamepadsStatus[gamepadIndex] = {buttons: {}, axes: {}})).buttons;
          gp.buttons.forEach(({pressed: value}, buttonIndex) => {
            var button = buttonsStatus[buttonIndex] || (buttonsStatus[buttonIndex] = {});
            if (value && (!button.value || (self.settings.repeatable.includes(buttonIndex) && t - button.t > self.settings[button.repeat ? 'buttonRepeatRate' : 'buttonRepeatDelay']))) {
              button.t = t;
              button.repeat = button.value;
              self.onGamepadPress(buttonIndex);
            }
            button.value = value;
          });
          var axesStatus = gamepadsStatus[gamepadIndex].axes;
          for (var i = 0; i < gp.axes.length; i += 2) {
            var prev = axesStatus[i] || (axesStatus[i] = {t: 0, d: 0});
            var value = Math.pow(gp.axes[i], 2) + Math.pow(gp.axes[i + 1], 2) > Math.pow(self.settings.deadzone, 2)
              && ['left', 'up', 'down', 'right'][(gp.axes[i] > 0) + ((gp.axes[i + 1] > 0) << 1)];
            var index = i >> 1;
            if (value && (self.settings.repeatableAxes.includes(index) ? t - prev.t > self.settings.axisRepeatRate : prev.value !== value)) {
              prev.t = t;
              self.onGamepadMove(index, value);
            }
            if (value && (!prev.value || t - prev.d > self.settings[prev.repeat ? 'buttonRepeatRate' : 'buttonRepeatDelay'])) {
              prev.d = t;
              prev.repeat = prev.value;
              self.onGamepadMoveAsDPad(index, gp.axes[i], gp.axes[i + 1]);
            }
            prev.value = value;
          }
          return true;
        }).includes(true))
          requestId = requestAnimationFrame(f);
      });
    };
    var stopLoop = () => cancelAnimationFrame(requestId);
    addEventListener('gamepadconnected', e => {
      gamepads[e.gamepad.index] = e.gamepad;
      console.log('gamepad connected: ' + e.gamepad.index);
      if (enabled)
        startLoop();
    });
    addEventListener('gamepaddisconnected', e => {
      delete gamepads[e.gamepad.index];
      console.log('gamepad disconnected: ' + e.gamepad.index);
    });
    return self;
  })();
  var nextRect = (rects, {left, top, right, bottom}) => {
    if (!rects?.length)
      return;
    var nearest = Infinity;
    var candidate, head;
    rects.forEach(rect => {
      if (!head || head.top > rect.top)
        head = rect;
      if (rect.top < bottom - 1)
        return;
      var distance = (rect.right >= left && rect.left <= right ? 0 : Math.pow(rect.left > left ? rect.left - right : left - rect.right, 2)) + Math.pow(rect.top - bottom, 2);
      if (nearest > distance) {
        nearest = distance;
        candidate = rect;
      }
    });
    return candidate || head;
  };
  var removeUnavailableElements = elements => elements.filter(e => e.checkVisibility({contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true})
    && (!e.htmlFor || document.getElementById(e.htmlFor)?.tagName === 'INPUT')
  );
  var getCursoredElement = elements => {
    if (!elements.length)
      return;
    var current = document.querySelector('[data-gamepad-cursor]');
    if (!current || !elements.includes(current)) {
      removeGamepadCursor();
      elements[0].setAttribute('data-gamepad-cursor', '');
      elements[0].scrollIntoView({block: 'nearest', inline: 'nearest'});
      return;
    }
    return current;
  };
  var moveGamepadCursor = (elements, direction) => {
    var current = getCursoredElement(elements);
    if (!current)
      return;
    current.removeAttribute('data-gamepad-cursor');
    var currentRect;
    var next = nextRect(elements.map(element => {
      var rect = element.getBoundingClientRect();
      rect = direction === 'left' ? {left: -rect.bottom, top: -rect.right, right: -rect.top, bottom: -rect.left}
        : direction === 'right' ? {left: -rect.bottom, top: rect.left, right: -rect.top, bottom: rect.right}
        : direction === 'up' ? {left: rect.left, top: -rect.bottom, right: rect.right, bottom: -rect.top}
        : {left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom}
      rect.element = element;
      if (element === current)
        currentRect = rect;
      return rect;
    }), currentRect)?.element;
    next.setAttribute('data-gamepad-cursor', '');
    next.scrollIntoView({block: 'nearest', inline: 'nearest'});
  };
  var removeGamepadCursor = () => Array.from(document.querySelectorAll('[data-gamepad-cursor]')).forEach(e => e.removeAttribute('data-gamepad-cursor'));
  var clickCursoredElement = elements => {
    var current = getCursoredElement(elements) || (elements.length <= 2 && elements.find(e => e.textContent === 'OK'));
    if (!current)
      return;
    if (current?.htmlFor)
      current = document.getElementById(current.htmlFor);
    current?.click();
  };
  var getCursorableElements = () => Array.from(
    (
      Array.from(document.querySelectorAll('.popup-overlay+.popup')).sort((a, b) => +getComputedStyle(a).zIndex < +getComputedStyle(b).zIndex ? 1 : -1)[0]
      || document
    ).querySelectorAll('button:not(#infobox-button),label[for]')
  ).filter(e => e.checkVisibility({contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true})
    && (!e.htmlFor || ['checkbox', 'radio'].includes(document.getElementById(e.htmlFor)?.type))
  );
  var getTopOverlay = () => Array.from(document.querySelectorAll('.popup-overlay')).sort((a, b) => +getComputedStyle(a).zIndex < +getComputedStyle(b).zIndex ? 1 : -1)[0];
  var gamepadLayout = [];
  gamepad.onGamepadPress = index => {
    if (document.getElementById('logged-out-page'))
      location.reload();
    var command = gamepadLayout[index];
    if (!command)
      return;
    switch (command) {
      case 'cancel':
        var overlay = getTopOverlay();
        if (overlay)
          overlay.click();
        else
          removeGamepadCursor();
        break;
      case 'ok':
        if (document.getElementById('rula-popup'))
          vueApp.handleRulaPopupKeydown({code: 'Enter'});
        else
          clickCursoredElement(getCursorableElements());
        break;
      case 'rula':
        if (document.getElementById('rula-popup'))
          document.querySelector('.popup-overlay')?.click();
        else if (!document.querySelector('.popup-overlay') && document.getElementById('input-textbox'))
          vueApp.requestRoomList();
        break;
      case 'mic':
        document.getElementById('voiceButton')?.click();
        break;
      case 'list':
        if (document.getElementById('user-list-popup'))
          document.querySelector('.popup-overlay')?.click();
        else if (!document.querySelector('.popup-overlay') && document.getElementById('input-textbox'))
          vueApp.openUserListPopup();
        break;
      case 'henshin':
        vueApp.socket?.emit('user-msg', '#henshin');
        break;
      case 'recieve':
        if (document.querySelector('.popup-overlay'))
          break;
        var recieveButtons = Array.from(document.querySelectorAll('[id^=take-stream-button-]'));
        if (recieveButtons.length)
          recieveButtons.forEach(b => b.click());
        else
          Array.from(document.querySelectorAll('[id^=drop-stream-button-]')).forEach(b => b.click());
        break;
      case 'stream':
        if (document.getElementById('stream-popup')) {
          getTopOverlay()?.click();
          break;
        }
        if (document.querySelector('.popup-overlay'))
          break;
        var streamButton = document.querySelector('[id^=start-video-streaming-button-]');
        if (streamButton)
          streamButton.click();
        else
          Array.from(document.querySelectorAll('[id^=stop-streaming-button-]')).forEach(b => b.click());
        break;
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        if (document.getElementById('rula-popup'))
          vueApp.handleRulaPopupKeydown({code: 'Arrow' + command[0].toUpperCase() + command.slice(1)});
        else
          moveGamepadCursor(getCursorableElements(), command);
        break;
    }
  };
  gamepad.onGamepadMove = (index, direction) => vueApp.socket && !document.querySelector('.popup-overlay') && vueApp[index ? 'sendNewBubblePositionToServer' : 'sendNewPositionToServer'](direction);
  gamepad.onGamepadMoveAsDPad = (index, x, y) => {
    if (!(document.querySelector('.popup-overlay') || document.getElementById('login-button')) || index !== 0)
      return;
    if (document.getElementById('rula-popup'))
      vueApp.handleRulaPopupKeydown({code: y > 0 ? 'ArrowDown' : 'ArrowUp'});
    else
      moveGamepadCursor(getCursorableElements(), ['left', 'up', 'down', 'right'][(x - y > 0) + ((x + y > 0) << 1)]);
  };
  // extension CSS
  document.head.appendChild(document.createElement('style')).textContent = '#chat-log-label{display:none}#chat-log-container{flex-direction:column}#enableSpeech:checked+button{background-color:#9f6161}.inactive-message:before{opacity:0.5}[data-gamepad-cursor]{border:3px solid red !important}';
  // config
  var userCSS = document.head.appendChild(document.createElement('style')), mentionSound, experimentalConfig;
  var vnCSS = document.head.appendChild(document.createElement('style'));
  var applyConfig = function () {
    userCSS.textContent = experimentalConfig.userCSS || '';
    vnCSS.textContent = (experimentalConfig.vtuberNiconico & 1 ? '.vtuber-character{display:none}' : '') +
                        (experimentalConfig.vtuberNiconico & 2 ? '.nico-nico-messages-container{display:none}' : '') +
                        (experimentalConfig.hideVoiceButton ? '#voiceButton{display:none}' : '') +
                        (experimentalConfig.hideWidgetButton || navigator.userAgent?.includes('Android') ? '#widgetButton{display:none}' : '') +
                        (experimentalConfig.hideLogWindowButton ? '#logWindowButton{display:none}' : '') +
                        (experimentalConfig.hideClearButton ? '#clearButton{display:none}' : '') +
                        (experimentalConfig.hideSaveButton ? '#saveButton{display:none}' : '') +
                        (experimentalConfig.hideConfigButton ? '#configButton{display:none}' : '') +
                        (experimentalConfig.hidePIP ? '.experimental-buttons{display:none}' : '') +
                        (experimentalConfig.brightness ? '#room-canvas{filter: brightness(' + experimentalConfig.brightness + ')}' : '') +
                        (experimentalConfig.showColorPicker ? '' : '#colorPicker{visibility:hidden;width:0;padding:0;border:0}') +
                        (experimentalConfig.silence || /iPhone|iPad/.test(navigator.userAgent) ? '' : '#silence{display:none}') +
                        (experimentalConfig.outdoor ? 'h1,#character-selection,#canvas-container,.changelog{display:none}' : '');
    if (experimentalConfig.iconSize)
      characterLogCSS.textContent = characterLogCSS.textContent.replace(/--characterlog-size:\d+px/, '--characterlog-size:' + experimentalConfig.iconSize + 'px');
    characterLogCSS.media = experimentalConfig.displayIcon ? '' : 'a';
    logWindow?.onstorage?.();
    if (experimentalConfig.hasOwnProperty('roomColor') && vueApp.currentRoom) {
      vueApp.currentRoom.backgroundColor = experimentalConfig.roomColor;
      vueApp.isRedrawRequired = true;
    }
    if (mentionSound = experimentalConfig.mentionSound && new Audio(experimentalConfig.mentionSound))
      mentionSound.volume = experimentalConfig.mentionVolume || 1;
    if (experimentalConfig.stopBack)
      history.pushState(null, null);
    if (experimentalConfig.gamepadDeadzone)
      gamepad.settings.deadzone = +experimentalConfig.gamepadDeadzone;
    gamepad.settings.disableVibration = !experimentalConfig.enableVibration;
    gamepad.settings.repeatable = [];
    gamepadLayout = experimentalConfig.gamepadLayout.map((command, index) => {
      if (['left', 'up', 'down', 'right'].includes(command))
        gamepad.settings.repeatable.push(index);
      return (experimentalConfig.swapGamepadButton && {ok: 'cancel', cancel: 'ok'}[command]) || command;
    });
    gamepad.enable(experimentalConfig.enableGamepad);
    widget?.paint();
  };
  window.modifyConfig = function (obj, mainWindow) {
    var json = JSON.stringify(obj);
    if (experimentalConfig.useCookie) {
      document.cookie = 'experimentalConfig=' + encodeURIComponent(json) + '; expires=Tue, 31-Dec-2037 00:00:00 GMT;';
    } else {
      document.cookie = 'experimentalConfig=; expires=Fri, 31-Dec-1999 23:59:59 GMT;';
      localStorage.setItem('experimentalConfig', json);
    }
    experimentalConfig = JSON.parse(json);
    if (mainWindow)
      configWindow?.load?.(experimentalConfig);
    applyConfig();
  };
  var configText = document.cookie.match(/experimentalConfig=([^;]+)/);
  experimentalConfig = Object.assign(Object.fromEntries(generateConfigMenu().map(({key, value}) => [key, value])), JSON.parse(configText?.[1] ? decodeURIComponent(configText[1]) : localStorage.getItem('experimentalConfig')));
  ['ttsAllowList', 'ttsDenyList', 'autoBlock', 'autoIgnore', 'wordFilter'].forEach(key => {
    if (experimentalConfig[key] && experimentalConfig[key].constructor !== Array)
      experimentalConfig[key] = experimentalConfig[key].split?.(',') || [experimentalConfig[key] + ''];
  });
  applyConfig();
  Array.from(document.querySelectorAll('#character-selection label')).forEach(label => label.setAttribute('style', 'font-size:0'));
  var isAnon = name => (new RegExp('^(?:' + vueApp.toDisplayName('') + '\\d*)?$')).test(name);
  var isMention = msg => vueApp.checkIfMentioned?.(msg);
  // widget
  var createSpan = (className, textContent) => Object.assign(document.createElement('span'), {className, textContent});
  var widget = {
    streaming: function (id, name) {
      if (!this.log || vueApp.ignoredUserIds.has(id) || !experimentalConfig.widgetStreaming)
        return;
      this.addLog(id, name, 'streaming' + (isAnon(name) ? ' anon' : ''), text('が配信開始', ' has started streaming.'));
    },
    access: function (id, name, entering) {
      if (!this.log || vueApp.ignoredUserIds.has(id))
        return;
      var anon = isAnon(name);
      if (!((experimentalConfig.widgetAccess && !anon) || (experimentalConfig.widgetAnonAccess && anon)))
        return;
      this.addLog(id, name, 'access' + (anon ? ' anon' : ''), text('が' + (entering ? '入室' : '退室'), ' has ' + (entering ? 'entered' : 'exited') + ' the room.'));
    },
    comment: function (id, name, comment) {
      if (!this.log || vueApp.ignoredUserIds.has(id) || !comment)
        return;
      var anon = isAnon(name);
      if (!((experimentalConfig.widgetComment && !anon) || (experimentalConfig.widgetAnonComment && anon) || (experimentalConfig.widgetMention && isMention(comment))))
        return;
      this.addLog(id, name, 'comment' + (anon ? ' anon' : ''), comment);
    },
    addLog: function (id, name, className, content) {
      var p = this.log.appendChild(document.createElement('p'));
      while (this.log.children.length > experimentalConfig.widgetLength)
        this.log.firstElementChild.remove();
      p.className = className;
      var splitedName = vueApp.toDisplayName(name + '').split('◆');
      p.append(createSpan('name', splitedName[0]), createSpan('ihash', toIHash(id + '')));
      if (splitedName[1])
        p.append(createSpan('trip', '◆' + splitedName[1]));
      if (className.includes('comment'))
        p.append(createSpan('separator', ': '));
      p.append(createSpan('content', content + ''));
      this.paint();
    },
    init: function () {
      var div = this.container = document.createElement('div');
      div.setAttribute('style', 'display:flex;order:5;visibility:hidden;display:none');
      var video = this.video = document.createElement('video');
      video.style.border = '1px solid #000';
      video.style.height = '100px';
      video.playsInline = video.muted = video.autoplay = true;
      var canvas = this.canvas = document.createElement('canvas');
      canvas.setAttribute('style', 'position:fixed;top:0;right:0;width:1px;height:1px');
      document.body.append(canvas);
      var ctx = this.ctx = canvas.getContext('2d');
      canvas.width = video.width = experimentalConfig.widgetWidth;
      canvas.height = video.height = experimentalConfig.widgetHeight;
      video.style.width = canvas.width / canvas.height * 100 + 'px';
      video.srcObject = canvas.captureStream(experimentalConfig.widgetFps);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      (async () => {
        for (var i = 0; i < 6 && !this.log; i++) {
          await sleep(500);
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          this.video.srcObject.getTracks?.()?.[0]?.requestFrame?.();
        }
      })();
      video.onpause = video.play;
      video.onenterpictureinpicture = () => {
        div.style.width = div.style.height = '1px';
        div.style.overflow = 'hidden';
      };
      var closeButton = document.createElement('button');
      closeButton.textContent = '×';
      video.onleavepictureinpicture = closeButton.onclick = () => this.close();
      div.append(video, '← ' + text('右クリックしてピクチャーインピクチャーを選択', 'Right-click and Select Picture-in-Picture'), closeButton);
      document.getElementById('chat-log-container').after(div);
    },
    open: function () {
      if (+localStorage.getItem('experimentalNotice') < 1) {
        asyncAlert(text('このメッセージを見てから、ログがリアルタイムで表示されない等の不具合があった場合は報告お願いします。\n\nWidget機能は再描画に問題があり、将来的に廃止される可能性があります。', 'If logs are not updated on widget, please contact author.'));
        localStorage.setItem('experimentalNotice', 1);
      }
      if (!this.log)
        this.container.style.display = this.container.style.visibility = '';
      this.log = document.createElement('div');
      this.log.className = 'log';
      this.paint();
      this.video.requestPictureInPicture?.().catch(async err => {
        if (err.name === 'NotSupportedError') {
          if (navigator.userAgent?.includes('Android')) {
            await asyncAlert(text('全画面表示になったら画面下から上にスワイプし、ホームボタンを押してください', 'Press home button after fullscreen'));
            this.video.requestFullscreen();
          } else {
            experimentalConfig.hidePIP = experimentalConfig.hideWidgetButton = true;
            modifyConfig(experimentalConfig, true);
            this.close();
          }
        }
      });
    },
    close: function () {
      this.log = null;
      if (this.video === document.pictureInPictureElement)
        document.exitPictureInPicture?.();
      this.container.style.visibility = 'hidden';
      this.video.remove();
      this.container.prepend(this.video);
    },
    paint: async function (retry) {
      if (!this.log || (retry && !this.img.complete))
        return;
      if (retry > 4) {
        asyncAlert('再描画エラー　報告お願いします　必要な情報はOSの種類（Windows, Mac, iPhoneとか）ブラウザの種類（Chrome, Edge, Firefoxとか）', 'Repaint error. Please tell me about OS and Browser.');
        return;
      }
      if (!retry) {
        var img = this.img = new Image();
        var width = this.canvas.width = this.video.width = experimentalConfig.widgetWidth;
        var height = this.canvas.height = this.video.height = experimentalConfig.widgetHeight;
        this.video.style.width = width / height * 100 + 'px';
        img.src = 'data:image/svg+xml,' + encodeURIComponent(
`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
<foreignObject width="${width}" height="${height}" requiredExtensions="http://www.w3.org/1999/xhtml">
<style>${experimentalConfig.widgetCSS}</style>
<body xmlns="http://www.w3.org/1999/xhtml">${(new XMLSerializer()).serializeToString(this.log)}</body></foreignObject></svg>`);
        await img.decode();
      }
      this.ctx.drawImage(this.img, 0, 0, width, height);
      this.video.srcObject.getTracks?.()?.[0]?.requestFrame?.();
      await sleep(500);
      var frames = this.video.getVideoPlaybackQuality?.()?.droppedVideoFrames || 0;
      if (this.lastDroppedVideoFrames < frames)
        this.paint((retry || 0) + 1);
      this.lastDroppedVideoFrames = frames;
    },
    lastDroppedVideoFrames: 0
  };
  console.log('injected');
  // 入室時
  var updateRoomState = vueApp.updateRoomState;
  var henshined, bubbleChanged;
  vueApp.updateRoomState = async function (dto) {
    var roomIsChanged = dto.currentRoom?.id !== vueApp.currentRoom?.id;
    // 部屋背景色変更
    if (experimentalConfig.roomColor)
      dto.currentRoom.backgroundColor = experimentalConfig.roomColor;
    // 部屋名をログ出力
    var roomName = vueApp.$i18next.t('room.' + dto?.currentRoom?.id);
    var numberOfUsers = (dto.connectedUsers.some(u => u.id === vueApp.myUserID) ? 0 : 1) + dto.connectedUsers.length;
    if (experimentalConfig.logRoomName && roomIsChanged)
      systemMessage(text(`${roomName}に入室 (${numberOfUsers}人)`, `Entered to  ${roomName} (${numberOfUsers} users)`));
    // 入室時吹き出しを読み上げない
    var enableTTS = vueApp.enableTextToSpeech;
    vueApp.enableTextToSpeech = false;
    var r = await updateRoomState.call(this, dto);
    vueApp.enableTextToSpeech = enableTTS;
    // 開発前の吹き出しを消す
    if (experimentalConfig.clearBubbleAtLogin === 1 ? dto?.currentRoom?.id === 'admin_st' : experimentalConfig.clearBubbleAtLogin) {
      Object.values(vueApp.users).forEach(u => u.message = '');
      vueApp.resetBubbleImages();
    }
    // デフォルトで受信状態にする
    if (experimentalConfig.takeStreamImmediately)
      for (var i = 0; i < dto.streams.length; i++)
        vueApp.wantToTakeStream(i);
    // ログ窓タイトル変更
    if (logWindow && !logWindow.closed)
      logWindow.onresize();
    // デフォで変身
    if (experimentalConfig.henshin && !henshined) {
      getObjectAsync(vueApp, 'socket').then(socket => socket.emit('user-msg', '#henshin'));
      henshined = true;
    }
    // デフォで吹き出し位置変更
    if (experimentalConfig.bubblePosition && !bubbleChanged) {
      getObjectAsync(vueApp, 'socket').then(socket => socket.emit('user-bubble-position', ['up', 'right',  'left',  'down'][experimentalConfig.bubblePosition]));
      bubbleChanged = true;
    }
    // グラフ
    graph = new Graph(dto, !roomIsChanged && graph?.moved);
    return r;
  };
  // 無視解除時
  var unignoreUser = vueApp.unignoreUser;
  vueApp.unignoreUser = function (userId) {
    if (experimentalConfig.ignoreAll === 1) {
      var trip = vueApp.users?.[userId]?.name?.match(/◆.{10}/)?.[0];
      if (trip) {
        if (!experimentalConfig.unignoreList)
          experimentalConfig.unignoreList = [];
        if (!experimentalConfig.unignoreList.some(name => trip.includes(name))) {
          experimentalConfig.unignoreList.push(trip);
          modifyConfig(experimentalConfig, true);
        }
      }
    }
    return unignoreUser.apply(this, arguments);
  };
  // ユーザー追加時
  var addUser = vueApp.addUser;
  vueApp.addUser = function (userDTO) {
    // 偽ナンバリング
    if (match(userDTO.name, ['/' + vueApp.toDisplayName('') + '\\d+/']))
      userDTO.name = '(' + userDTO.name + ')';
    // 偽トリップ
    userDTO.name = userDTO.name?.replace(/◇|◊|🔶|🔷|🔸|🔹/g, 'O');
    // 名無しナンバリング
    if (experimentalConfig.numbering && typeof userDTO.id === 'string') {
      userDTO.name = vueApp.toDisplayName(userDTO.name);
      if (experimentalConfig.numbering === 1 && userDTO.name === vueApp.toDisplayName(''))
        userDTO.name += parseInt(userDTO.id.slice(-3), 16);
    }
    // 偽SYSTEM
    if (match(userDTO.name, ['' + /[SＳ][YＹ][SＳ][TＴ][EＥ][MＭ]/]))
      userDTO.name += '(偽)';
    // 自動あぼーん
    if (
      userDTO.id !== vueApp.myUserID && vueApp.socket &&
      (
        match(userDTO.name, experimentalConfig.autoBlock, experimentalConfig.filteringHelper) ||
        (experimentalConfig.ignoreAll === 2 && !match(userDTO.name, experimentalConfig.unignoreList))
      )
    ) {
        vueApp.ignoreUser(userDTO.id);
        abon(userDTO.id);
        userDTO.aboned = true;
        if (!experimentalConfig.withoutBlockMsg)
          systemMessage(userDTO.name + text('を自動相互あぼーんした', ' has been blocked automatically'));
    }
    // 自動一方あぼーん
    if (
      userDTO.id !== vueApp.myUserID &&
      (
        match(userDTO.name, experimentalConfig.autoIgnore, experimentalConfig.filteringHelper) ||
        (experimentalConfig.ignoreAll === 1 && !match(userDTO.name, experimentalConfig.unignoreList))
      )
    ) {
      vueApp.ignoreUser(userDTO.id);
      userDTO.aboned = true;
    }
    // 吹き出しNGワード
    if (match(userDTO.lastRoomMessage, experimentalConfig.bubbleFilter))
      queueMicrotask(() => {if (vueApp.users[userDTO.id]) vueApp.users[userDTO.id].message = '';});
    return addUser.call(this, userDTO);
  };
  // 名前補完
  var autoComplete = {};
  autoComplete.onkeydown = function (event) {
    if (experimentalConfig.autoComplete && event.target.id === 'input-textbox') {
      if (event.key === 'Tab') {
        event.preventDefault();
        if (!autoComplete.candidates) {
          var search = event.target.value.match(/[^ 　@＠>＞]*$/)?.[0] || '', s = search.toLowerCase();
          autoComplete.body = event.target.value.slice(0, event.target.value.length - search.length);
          autoComplete.candidates = Array.from(new Set(Object.values(vueApp.users)
            .filter(u => {
              if (u.id === vueApp.myUserID)
                return false;
              var n = ('' + u.name).normalize('NFKD').replace(/[\u0300-\u036f]+/g, '').normalize().toLowerCase();
              delete u.tripComplete;
              return (n[0] !== '◆' && !n.indexOf(s)) || (u.tripComplete = n.indexOf('◆' + s) !== -1);
            })
            .sort((a, b) => (a.lastCommentTime || 0) < (b.lastCommentTime || 0) ? 1 : -1)
            .map(u => u.tripComplete ? u.name : u.name.split('◆')[0])
          ));
          autoComplete.candidates.push(search);
          autoComplete.index = 0;
        }
        event.target.value = autoComplete.body + autoComplete.candidates[autoComplete.index];
        autoComplete.index = (autoComplete.index + 1) % autoComplete.candidates.length;
      } else {
        delete autoComplete.candidates;
      }
    }
  };
  // ブラウザバックを止める
  addEventListener('popstate', () => {
    if (experimentalConfig.stopBack)
      history.go(1);
  });
  document.addEventListener('keydown', event => {
    if (!event.key)
      return;
    // Ctrl+Delキーで吹き出し消す
    if (event.ctrlKey && event.key === 'Delete') {
      for (var id in vueApp.users)
        vueApp.users[id].message = '';
      vueApp.resetBubbleImages();
    // 動画回転
    } else if (event.altKey && /^[1-9]$/.test(event.key)) {
      var video = document.getElementById('received-video-' + (event.key - 1));
      if (video)
        video.style.transform = 'rotate(' + (video.dataset.rotate = (+(video.dataset.rotate || 0) + 90) % 360) + 'deg)';
    // 経路移動中止
    } else if (event.key === 'Escape') {
      vueApp.route.clear();
    }
    // 名前補完
    autoComplete.onkeydown(event);
  });
  // 新しいメッセージボタン
  var chatLog, isAtBottom = () => (chatLog.scrollHeight - chatLog.clientHeight) - chatLog.scrollTop < 5;
  var newMessageButtonContainer = document.createElement('div');
  newMessageButtonContainer.id = 'new-message-button-container';
  newMessageButtonContainer.setAttribute('style', 'height:0;position:relative;top:-40px;text-align:center;width:100%;user-select:none;pointer-events:none');
  var newMessageButton = newMessageButtonContainer.appendChild(createButtonContainer()).appendChild(document.createElement('button'));
  newMessageButton.onclick = () => {
    chatLog.scrollTop = chatLog.scrollHeight - chatLog.clientHeight;
  };
  newMessageButton.style.pointerEvents = 'auto';
  var displayUserMessage = vueApp.displayUserMessage;
  vueApp.displayUserMessage = async function (user, msg) {
    // 配信遠隔停止
    if (vueApp.streamSlotIdInWhichIWantToStream !== null && /^(?:配信停止|stop streaming)$/i.test(msg) && match(vueApp.users[user?.id]?.name, experimentalConfig.streamStopper))
      vueApp.stopStreaming();
    // NGワード
    if (user?.id && match(msg, experimentalConfig.wordFilter, experimentalConfig.filteringHelper)) {
      if (user.id !== vueApp.myUserID && experimentalConfig.wordBlock) {
        if (experimentalConfig.wordBlock === 3)
          vueApp.ignoreUser(user.id);
        else
          abon(user.id);
        if (!experimentalConfig.withoutBlockMsg)
          systemMessage(user.name + text('をNGワードあぼーんした', ' has been blocked by filtering'));
      }
      if (experimentalConfig.wordBlock !== 2)
        return;
    }
    // 吹き出しNGワード
    if (match(msg, experimentalConfig.bubbleFilter))
      queueMicrotask(() => {if (user) user.message = '';});
    // 読み上げ許可拒否リスト
    if (
      vueApp.enableTextToSpeech && 
      (
        (experimentalConfig.ttsAllowList?.length && !match(user?.name, experimentalConfig.ttsAllowList)) ||
        match(user?.name, experimentalConfig.ttsDenyList)
      )
    ) {
      vueApp.enableTextToSpeech = false;
      var promise = displayUserMessage.apply(this, arguments);
      vueApp.enableTextToSpeech = true;
      return promise;
    }
    return displayUserMessage.apply(this, arguments);
  };
  var writeMessageToLog = vueApp.writeMessageToLog;
  vueApp.writeMessageToLog = async function (userName, msg, userId) {
    // 新しいメッセージボタン
    if (!chatLog) {
      chatLog = document.getElementById('chatLog');
      chatLog.addEventListener('scroll', () => {
        if (isAtBottom())
          newMessageButtonContainer.style.display = 'none';
      });
    }
    if (!chatLog.parentNode.contains(newMessageButtonContainer)) {
      newMessageButton.textContent = text('↓ 新しいメッセージ', '↓ New Messages');
      newMessageButtonContainer.style.display = 'none';
      chatLog.parentNode.appendChild(newMessageButtonContainer);
    }
    if (!isAtBottom())
      newMessageButtonContainer.style.display = '';
    // いかおに
    if (ikaoni.MASTER_WORD === msg) {
      ikaoni.players = {};
      ikaoni.players[ikaoni.masterId = userId] = userName;
      ikaoni.lastPlayTime = (new Date()).getTime();
    } else if (ikaoni.playing && ikaoni.masterId === userId && msg?.startsWith(vueApp.myUserID)) {
      sendMessage('#ika');
      ikaoni.ikaed = true;
    } else if (ikaoni.waiting() && msg === 'いかおに')
      ikaoni.players[userId] = userName;
    return writeMessageToLog.apply(this, arguments);
  };
  // Enter1回で吹き出しを消す
  var handleMessageInputKeypress = vueApp.handleMessageInputKeypress;
  vueApp.handleMessageInputKeypress = function (event) {
    var v = handleMessageInputKeypress.apply(this, arguments);
    if (experimentalConfig.clearBubble && v === false)
      vueApp.socket.emit('user-msg', '');
    return v;
  };
  // 自動色分け
  var saveTripColor = () => localStorage.setItem('experimentalTripColor', JSON.stringify(
    Array.from(document.querySelectorAll('.tripColor')).map(element => ['style', {'class': 'tripColor', id: element.id}, element.textContent])
  ));
  JSML(document.head, 'append', JSON.parse(localStorage.getItem('experimentalTripColor')));
  // ログ右クリックメニュー
  var logMenu = document.body.appendChild(document.createElement('select'));
  var selectedMessage = {};
  logMenu.setAttribute('style', 'position:fixed;display:none');
  logMenu.onchange = function () {
    switch (logMenu.value) {
      case 'color':
        var colorPicker = document.getElementById('colorPicker');
        var styleId = selectedMessage.trip || selectedMessage.userId;
        var attrName = selectedMessage.trip ? 'data-trip' : 'data-user-id';
        var style = (document.getElementById('color-' + styleId) || document.head.appendChild(document.createElement('style')));
        style.id = 'color-' + styleId;
        if (selectedMessage.trip)
          style.className = 'tripColor';
        if (logWindow && !logWindow.closed) {
          var logDoc = logWindow.document;
          var style2 = (logDoc.getElementById(style.id) || logDoc.head.appendChild(logDoc.createElement('style')));
          style2.id = style.id;
        }
        (colorPicker.onchange = colorPicker.oninput = function () {
          style.textContent = `[${attrName}="${styleId}"],[${attrName}="${styleId}"] .message-author{color:${colorPicker.value}}`;
          if (style2)
            style2.textContent = style.textContent;
          if (style.className === 'tripColor')
            saveTripColor();
        })();
        colorPicker.click();
        break;
      case 'uncolor':
        document.getElementById('color-' + selectedMessage.trip)?.remove();
        document.getElementById('color-' + selectedMessage.userId)?.remove();
        if (logWindow && !logWindow.closed) {
          logWindow.document.getElementById('color-' + selectedMessage.trip)?.remove();
          logWindow.document.getElementById('color-' + selectedMessage.userId)?.remove();
        }
        if (selectedMessage.trip)
          saveTripColor();
        break;
      case 'ignore':
        vueApp.ignoreUser(selectedMessage.userId);
        break;
      case 'block':
        vueApp.blockUser(selectedMessage.userId);
        break;
      case 'mention':
        var textbox = document.getElementById('input-textbox');
        if (!textbox)
          break;
        textbox.value += (textbox.value.length && !textbox.value.endsWith(' ') ? ' ' : '') + '@' + selectedMessage.name + ' ';
        textbox.focus();
        break;
      case 'quote':
        var textbox = document.getElementById('input-textbox');
        if (!textbox)
          break;
        var length = textbox.value.length;
        textbox.value += ' > ' + selectedMessage.body;
        textbox.focus();
        textbox.setSelectionRange(length, length);
        break;
    }
    logMenu.style.display = 'none';
  };
  document.addEventListener('click', function (event) {
    if (event.target.parentNode !== logMenu)
      logMenu.style.display = 'none';
  });
  document.addEventListener('contextmenu', function (event) {
    logMenu.style.display = 'none';
    if (!event.ctrlKey && event.target.classList.contains('message-author')) {
      selectedMessage = {
        userId: event.target.parentNode.dataset.userId,
        trip: event.target.parentNode.dataset.trip || '',
        body: event.target.parentNode.querySelector('.message-body')?.textContent || ''
      };
      JSML(logMenu, 'clear', [
        ['option', {disabled: true, selected: true}, '-'],
        ['option', {value: 'color'}, text('色', 'Color')],
        ['option', {value: 'uncolor'}, text('色解除', 'Uncolor')],
        ['option', {value: 'mention'}, text('メンション', 'Mention')],
        ['option', {value: 'quote'}, text('引用', 'Quote')],
        ['option', {value: 'ignore'}, text('一方あぼーん', 'Ignore')],
        ['option', {value: 'block'}, text('相互あぼーん', 'Block')]
      ]);
      logMenu.size = logMenu.options.length;
      logMenu.options[0].text = selectedMessage.name = (event.target.textContent[0] === '◆' ? event.target.previousSibling.textContent : '') + event.target.textContent;
      logMenu.style.bottom = (document.documentElement.clientHeight - event.clientY) + 'px';
      logMenu.style.left = event.pageX + 'px';
      logMenu.style.display = 'block';
      event.preventDefault();
    }
  });
  // ユーザーリスト表示時
  var getUserListForListPopup = vueApp.getUserListForListPopup;
  vueApp.getUserListForListPopup = function () {
    var output = getUserListForListPopup.apply(this, arguments);
    if (experimentalConfig.numbering === 2)
      output.forEach(u => {
        if (u.isInRoom)
          u.name = addIHash(u.name, u.id);
      });
    return output;
  };
  // ログ追加時
  var writeLogToWindow;
  var autoColorIndex = 0;
  HTMLDivElement.prototype.appendChild = function (aChild) {
    if (this.id === 'chatLog') {
      try {
        // 白トリップ表示
        if (experimentalConfig.numbering === 2 && aChild.dataset.userId && aChild.dataset.userId !== 'null')
          JSML(aChild.querySelector('.message-author'), 'append', toIHash(aChild.dataset.userId));
        // ルーラリンク
        var messageBody = aChild.querySelector('.message-body>span') || aChild.querySelector('.message-body');
        if (messageBody)
          applyRulaLink(messageBody);
        if (!this.childNodes.length)
          Array.from(document.querySelectorAll('style[id^=color-]:not(.tripColor)')).forEach(style => style.remove());
        if (aChild.dataset.userId && aChild.dataset.userId !== 'null') {
          // キャラ付ログ
          var user = vueApp.users[aChild.dataset.userId];
          if (user) {
            loadCharacterIcon(aChild.dataset.characterId = user.character?.characterName + (user.isAlternateCharacter ? '_alt' : ''));
            if (user.isInactive)
              aChild.classList.add('inactive-message');
          }
          // 自動色分け
          if (/◆(.{10})/.test(user?.name))
            aChild.dataset.trip = RegExp.$1;
          if (experimentalConfig.autoColor && (!aChild.dataset.trip || !document.getElementById('color-' + aChild.dataset.trip)) && !document.getElementById('color-' + aChild.dataset.userId)) {
            var colorList = experimentalConfig.autoColorList?.length ? experimentalConfig.autoColorList : ['#ff8000', '#008000', '#0080ff', '#8060ff', '#ff60ff'];
            var style = document.head.appendChild(document.createElement('style'));
            style.id = 'color-' + aChild.dataset.userId;
            style.textContent = `[data-user-id="${aChild.dataset.userId}"],[data-user-id="${aChild.dataset.userId}"] .message-author{color:${colorList[autoColorIndex++ % colorList.length]}}`;
            if (logWindow && !logWindow.closed)
              logWindow.document.head.append(style.cloneNode(true));
          }
          // 発言間隔秒数
          if (messageBody && user && experimentalConfig.spammer && experimentalConfig.displayMsgInterval && user.commentInterval && user.commentInterval !== Infinity) {
            var values = [user.commentInterval];
            if (user.commentIntervalAverage && user.commentIntervalAverage !== Infinity)
              values.push(user.commentIntervalAverage);
            JSML(messageBody, 'append', [` (${values.map(v => (v + '').replace(/(\.\d)\d+$/, '$1')).join(' ')})`]);
          }
        }
        // ログ窓に書き出し
        if (writeLogToWindow)
          writeLogToWindow(aChild);
      } catch (err) {
        consolelog(err);
      }
    }
    return Node.prototype.appendChild.call(this, aChild);
  };
  // ログイン時
  var logWindow, configWindow;
  var onlogin = function () {
    document.getElementById('disableButtonContainer')?.remove();
    // 音声入力
    var textbox = document.getElementById('input-textbox');
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      var buttonContainer = createButtonContainer();
      buttonContainer.appendChild(textbox.previousSibling);
      JSML(buttonContainer, 'append', [
        ['br'],
        ['input', {type: 'checkbox', id: 'enableSpeech', style: 'display:none'}],
        ['button', {type: 'checkbox', id: 'voiceButton', onclick: function () {this.previousSibling.click()}}, text('音声', 'Voice')]
      ]);
      textbox.before(buttonContainer);
      var enableSpeech = document.getElementById('enableSpeech');
      enableSpeech.onclick = function () {
        recognition.lang = experimentalConfig.voiceLang || vueApp.$i18next?.language || vueApp.$i18n?.locale;
        recognition[enableSpeech.checked ? 'start' : 'stop']();
      };
      var recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = function (event) {
        var result = [];
        for (var i = event.resultIndex; i < event.results.length; i++)
          if (event.results[i].isFinal)
            result.push(event.results[i][0].transcript);
        if (!(result = result.join(' ')))
          return;
        if (experimentalConfig.voiceLog)
          vueApp.writeMessageToLog(text('音声入力', 'Voice input'), result, 'voice input');
        else
          sendMessage(text(experimentalConfig.voiceFormatGen || '音声入力:message', experimentalConfig.voiceFormatFor || 'Voice input:message').replace(/message|$/, result));
      };
      recognition.onend = function () {
        if (enableSpeech.checked)
          recognition.start();
      };
    }
    // ログ窓
    var logButtons = createButtonContainer();
    logButtons.setAttribute('style', 'all:unset;display:flex;order:4');
    document.getElementById('chat-log-container').after(logButtons);
    var widgetButton = logButtons.appendChild(document.createElement('button'));
    widgetButton.id = 'widgetButton';
    widgetButton.textContent = 'Widget';
    widgetButton.onclick = () => widget.open();
    writeLogToWindow = function (div) {
      if (!logWindow || logWindow.closed)
        return;
      var log = logWindow.document.body.firstElementChild;
      var bottom = (log.scrollHeight - log.clientHeight) - log.scrollTop < 5;
      log.append(logWindow.document.importNode(div, true));
      if (bottom)
        log.scrollTop = log.scrollHeight - log.clientHeight;
      else
        logWindow.document.title = text('↓ 新しいメッセージ', '↓ New Messages');
    };
    var logWindowButton = logButtons.appendChild(document.createElement('button'));
    logWindowButton.id = 'logWindowButton';
    logWindowButton.textContent = text('ログ窓', 'Log Window');
    logWindowButton.onclick = async function () {
      if (logWindow && !logWindow.closed) {
        logWindow.focus();
        return;
      }
      window.logWindow = logWindow = open('about:blank', 'log' + (new Date()).getTime(), 'width=300,height=500,menubar=no,toolbar=no,location=no');
      if (!logWindow) {
        asyncAlert(text('ポップアップを許可してください', 'Allow to popup'));
        return;
      }
      if (logWindow.document.readyState !== 'complete')
        await new Promise(resolve => logWindow.onload = resolve);
      writeLogWindowHTML(
        logWindow.document,
        vueApp.$i18next.t('room.' + vueApp.currentRoom.id),
        Array.from(document.querySelectorAll('style[id^=color]')).map(element => ['style', {'class': 'tripColor', id: element.id}, element.textContent]),
        text('切断されたログ', 'Disconnected log')
      );
      logWindow.onfocus = function () {
        logWindow.document.body.lastElementChild.focus();
      };
      logWindow.onstorage = function () {
        if (!this.closed)
          logWindow.document.getElementById('log-style').textContent = experimentalConfig.logWindowCSS + (experimentalConfig.displayIcon ? characterLogCSS.textContent : '');
      };
      logWindow.onstorage();
      logWindow._vueApp = window._vueApp;
      (function onload() {
        var log = logWindow.document.createElement('div');
        log.id = 'chatLog';
        JSML(log, 'append', innerJSML(document.getElementById('chatLog')));
        log.style.height = log.style.width = '';
        logWindow.document.body.firstElementChild.before(log);
        log.scrollTop = log.scrollHeight - log.clientHeight;
        logWindow.onresize = log.onscroll = function () {
          if ((log.scrollHeight - log.clientHeight) - log.scrollTop < 5)
            logWindow.document.title = vueApp.$i18next.t('room.' + vueApp.currentRoom.id);
        };
        logWindow.document.body.lastElementChild.onkeypress = function (event) {
          if (this.value && event.key === 'Enter') {
            sendMessage(this.value);
            this.value = '';
          }
        };
        logWindow.document.body.lastElementChild.onkeydown = autoComplete.onkeydown;
      })();
    };
    addEventListener('unload', () => {
      if (logWindow && !logWindow.closed) {
        logWindow.document.title = text('切断されたログ', 'Disconnected log');
        logWindow.clearInterval(logWindow.interval);
      }
    });
    // ログクリアボタン
    var clearLog = logButtons.appendChild(document.createElement('button'));
    clearLog.id = 'clearButton';
    clearLog.textContent = text('クリア', 'Clear');
    clearLog.onclick = vueApp.clearLog;
    // ログ保存ボタン
    var download = logButtons.appendChild(document.createElement('button'));
    download.id = 'saveButton';
    download.textContent = text('保存', 'Save');
    download.onclick = function () {
      var log = document.getElementById('chatLog').innerText;
      if (!log)
        return;
      var opts = {year: 'numeric'};
      opts.month = opts.day = opts.hour = opts.minute = opts.second = '2-digit';
      downloadText(log.replace(/([^\r])\n/g, '$1\r\n'), (new Date()).toLocaleString([], opts).replace(/\D/g, '') + '.txt');
    };
    // 設定
    var configButton = logButtons.appendChild(document.createElement('button'));
    configButton.textContent = text('設定', 'Config');
    configButton.id = 'configButton';
    configButton.onclick = async function () {
      if (configWindow && !configWindow.closed) {
        try {
          configWindow.focus();
          return;
        } catch (err) {}
      }
      configWindow = open('about:blank');
      if (!configWindow) {
        asyncAlert(text('ポップアップを許可してください', 'Allow to popup'));
        return;
      }
      if (configWindow.document.readyState !== 'complete')
        await new Promise(resolve => configWindow.onload = resolve);
      writeConfigHTML(
        configWindow.document,
        text('拡張機能の設定', 'Experimental Config'),
        text(0, 1),
        generateConfigMenu(),
        experimentalConfig
      );
    };
    // カラーピッカー
    var colorPicker = logButtons.appendChild(document.createElement('input'));
    colorPicker.id = 'colorPicker';
    colorPicker.type = 'color';
    widget.init();
  };
  if (document.getElementById('input-textbox')) {
    onlogin();
  } else {
    var connectToServer = vueApp.connectToServer;
    vueApp.connectToServer = async function () {
      // 内藤髪制御
      if (localStorage.getItem('characterId') === 'naito' && experimentalConfig.hairControl) {
        arguments[2] = vueApp.characterId = experimentalConfig.hairControl === 1 ? 'naito' : 'funkynaito';
        vueApp.selectedCharacter = vueApp.allCharacters.find(c => c.characterName === vueApp.characterId);
      }
      var r = await connectToServer.apply(this, arguments);
      onlogin();
      return r;
    };
  }
  // 呼び出し通知
  var getCharacterPath = user => {
    var name = user.characterId || user.character?.characterName;
    return 'characters/' + name + '/front-standing.' + (vueApp.allCharacters.find(c=>c.characterName===name) || {format:'svg'}).format;
  }
  var pngCache = {};
  var SVG2PNG = async function (url) {
    var callback;
    if (url.slice(-3) === 'png')
      return url;
    if (pngCache[url])
      return pngCache[url];
    try {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = canvas.height;
        ctx.drawImage(img, 0, 0);
        callback(pngCache[url] = canvas.toDataURL('image/png'));
      };
      img.src = 'data:image/svg+xml,' + encodeURIComponent(await (await fetch(url)).text());
    } catch (err) {
      return url;
    }
    return {then:c=>callback=c};
  };
  var mention;
  var mentionNotification = async function (user, msg) {
    if (
      window.Notification &&
      experimentalConfig.notifyMention &&
      !document.hasFocus() &&
      user &&
      !vueApp.ignoredUserIds.has(user.id) &&
      isMention(msg)
    ) {
      mention = new Notification(user.name, {
        // ChromeはNotification.iconにSVGを指定できない
        icon: await SVG2PNG(getCharacterPath(user)),
        tag: 'mention',
        body: msg,
        requireInteraction: true
      });
      mention.onclick = function () {
        if (experimentalConfig.replyMsg)
          sendMessage(experimentalConfig.replyMsg);
        // Chromeはクリック時既定の動作がない
        focus();
        document.getElementById('input-textbox').focus();
      };
      mentionSound?.play?.();
    }
  };
  addEventListener('focus', function () {
    if (mention)
      mention.close();
  });
  // 入退室通知
  var accessNotification = async function (user, msg) {
    var notifyAccess = experimentalConfig.notifyAccess;
    if (
      window.Notification &&
      (((notifyAccess & 1) && document.hasFocus()) || ((notifyAccess & 2) && !document.hasFocus())) &&
      !vueApp.ignoredUserIds.has(user.id)
    ) {
      (new Notification(user.name, {
        // ChromeはNotification.iconにSVGを指定できない
        icon: await SVG2PNG(getCharacterPath(user)),
        tag: 'access',
        body: msg
      })).onclick = function (event) {
        this.close();
        event.preventDefault();
      };
    }
  };
  // 配信通知
  var streamNotification = async function (user, index) {
    if (window.Notification && experimentalConfig.notifyStream && !vueApp.showNotifications && !document.hasFocus()) {
      (new Notification(user.name, {
        // ChromeはNotification.iconにSVGを指定できない
        icon: await SVG2PNG(getCharacterPath(user)),
        tag: 'stream',
        body: text('ﾁｬﾝﾈﾙ' + (index + 1) + 'で配信開始', 'Start stream in Channel ' + (index + 1))
      })).onclick = function (event) {
        vueApp.wantToTakeStream(index);
        this.close();
        event.preventDefault();
      };
    }
  };
  // チェス通知
  var chess;
  var chessNotification = function () {
    if (window.Notification) {
      chess = new Notification(text('チェス', 'Chess'), {
        tag: 'chess',
        body: text('あなたの番です', "It's your turn."),
        requireInteraction: true
      });
      chess.onclick = focus.bind(window);
    }
    mentionSound?.play?.();
  };
  var closeChessNotification = function () {
    chess?.close();
  };
  addEventListener('focus', closeChessNotification);
  addEventListener('mousedown', closeChessNotification);
  // ステミキ
  var mute = vueApp.mute;
  vueApp.mute = function () {
    try {
      Array.from(document.querySelectorAll('.input-volume')).forEach(input => {
        input.dataset.value = input.value;
        input.value = 0;
        input.disabled = true;
        input.oninput();
      });
    } catch (err) {
      asyncAlert(text('ミュートでエラーが発生した', 'failed to mute'));
      consolelog(err);
    }
    return mute.apply(this, arguments);
  };
  var unmute = vueApp.unmute;
  vueApp.unmute = function () {
    var result = unmute.apply(this, arguments);
    Array.from(document.querySelectorAll('.input-volume')).forEach(input => {
      input.value = input.dataset.value ? +input.dataset.value : 1;
      input.disabled = false;
      input.oninput();
    });
    return result;
  };
  var wsm = {
    show: async function (show) {
      if (show) {
        var mutebtn = await querySelectorAsync('button.mute-unmute-button');
        if (!this.addAudio) {
          JSML(this.addAudio = document.createElement('select'), 'append', [
            ['option', text('配信音声の追加', 'Add voice')],
            ['option', {value: 'browser'}, text('ブラウザの音声', 'browser sound')],
            ['option', {value: 'monitor'}, text('PCの音声', 'speaker sound')],
          ]);
          this.addAudio.style.display = 'block';
          this.addAudio.style.marginTop = '10px';
          this.addAudio.onchange = this.add;
          (await navigator.mediaDevices.enumerateDevices()).forEach((device, i) => {
            if (device.kind !== 'audioinput' || /default|communications/.test(device.deviceId))
              return;
            var opt = document.createElement('option');
            opt.value = device.deviceId;
            opt.text = device.label || ('mic ' + i);
            this.addAudio.add(opt);
          });
        }
        mutebtn.parentNode.after(this.addAudio);
        this.streamVolume?.remove();
        this.addVolume(this.streamVolume = document.createElement('div'), vueApp.outboundAudioProcessor.gain);
        mutebtn.parentNode.before(this.streamVolume);
      } else {
        this.addAudio?.remove();
        this.streamVolume?.remove();
      }
    },
    add: async function () {
      var selected = this.value;
      this.selectedIndex = 0;
      var stream;
      try {
        if (selected === 'browser' || selected === 'monitor') {
          await asyncAlert(text('「音声を共有」をチェックして画面共有してください。映像は変わりません。\nFirefoxとスマホは多分使えません。', 'Check "Share audio", and share screen. Video is not changed.\nMaybe Firefox and mobile cannot use "Share audio".'));
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {displaySurface: selected},
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
              channelCount: 2
            }
          });
          stream.getVideoTracks().forEach(track => {
            track.stop();
            stream.removeTrack(track);
          });
          if (!stream.getAudioTracks().length)
            throw new Error('Audio track not found');
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: {exact: selected},
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
        }
      } catch (err) {
        asyncAlert(text('音声が取得できなかった', 'Audio track not found'));
        consolelog(err);
        return;
      }
      if (!vueApp.outboundAudioProcessor) {
        asyncAlert('outboundAudioProcessor not found');
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      var track = stream.getAudioTracks()[0];
      vueApp.outboundAudioProcessor.stream.addTrack(track);
      track.stop = function () {
        closeBtn.click();
        return track.__proto__.stop.apply(this, arguments);
      };
      var gain = vueApp.outboundAudioProcessor.context.createGain();
      vueApp.outboundAudioProcessor.context.createMediaStreamSource(stream).connect(gain);
      gain.connect(vueApp.outboundAudioProcessor.pan);
      var div = document.createElement('div');
      this.after(div);
      div.setAttribute('style', 'border:1px solid #000;width:fit-content;padding:5px');
      var title = div.appendChild(document.createElement('p'));
      title.textContent = stream.getAudioTracks()[0].label;
      var closeBtn = title.appendChild(document.createElement('button'));
      closeBtn.style.cssFloat = 'right';
      closeBtn.textContent = '×';
      stream.oninactive = closeBtn.onclick = function () {
        stream.getTracks().forEach(t => t.stop());
        gain.disconnect();
        div.remove();
        vueApp.outboundAudioProcessor?.stream.removeTrack(stream.getAudioTracks()[0]);
        stream.oninactive = closeBtn.onclick = null;
      };
      wsm.addVolume(div, gain);
    },
    addVolume: function (div, gain) {
      var control = div.appendChild(document.createElement('p'));
      control.textContent = 'Volume ';
      var vol = control.appendChild(document.createElement('input'));
      vol.type = 'range';
      vol.className = 'input-volume';
      vol.min = 0;
      vol.max = 1;
      vol.step = 'any';
      vol.disabled = vueApp.outboundAudioProcessor.isMute;
      vol.value = gain.gain.value = vol.disabled ? 0 : 1;
      vol.oninput = function () {
        gain.gain.value = vol.value;
      };
    }
  };
  // グラフ
  var graph, Graph = function ({currentRoom, connectedUsers}, moved) {
    this.moved = moved;
    this.nodes = JSON.parse('[' + ('[' + '{},'.repeat(currentRoom.size.x).slice(0, -1) + '],').repeat(currentRoom.size.y).slice(0, -1) + ']');
    this.room = currentRoom.id;
    currentRoom.blocked.forEach(({x, y}) => this.nodes[y][x] = null);
    if (this.room === 'idoA')
      delete this.nodes[6][6];
    var flag = [false];
    for (var y = 0; y < currentRoom.size.y; y++)
      for (var x = 0; x < currentRoom.size.x; x++) {
        var node = this.nodes[y][x], tmp;
        if (!node)
          continue;
        node.edges = new Map();
        if (tmp = this.nodes[y][x - 1])
          node.edges.set(tmp, {direction: 'left', reverse: 'right'});
        else if (tmp === null)
          node.blocked = 'left';
        if (tmp = this.nodes[y][x + 1])
          node.edges.set(tmp, {direction: 'right', reverse: 'left'});
        else if (tmp === null)
          node.blocked = 'right';
        if (tmp = this.nodes[y - 1]?.[x])
          node.edges.set(tmp, {direction: 'down', reverse: 'up'});
        else if (tmp === null)
          node.blocked = 'down';
        if (tmp = this.nodes[y + 1]?.[x])
          node.edges.set(tmp, {direction: 'up', reverse: 'down'});
        else if (tmp === null)
          node.blocked = 'up';
        node.users = new Map();
        node.flag = flag;
      }
    currentRoom.forbiddenMovements.forEach(({xFrom, yFrom, xTo, yTo}) => {
      var from = this.nodes[yFrom]?.[xFrom], to = this.nodes[yTo]?.[xTo];
      if (!from || !to)
        return;
      var edge = from.edges.get(to);
      if (edge?.direction) {
        if (!from.blocked)
          from.blocked = edge.direction;
        if (edge.reverse)
          delete edge.direction;
        else
          from.edges.delete(to);
      }
      var edge = to.edges.get(from);
      if (edge?.direction)
        delete edge.reverse;
      else
        to.edges.delete(from);
    });
    connectedUsers.forEach(({id, position}) => this.nodes[position.y]?.[position.x]?.users.set(id));
    for (var id in currentRoom.doors) {
      var door = currentRoom.doors[id];
      if (this.nodes[door.y]?.[door.x])
        this.nodes[door.y][door.x].door = {id, direction: door.direction, target: door.target};
    }
  };
  Graph.prototype.update = function (userId, xFrom, yFrom, xTo, yTo) {
    this.nodes[yFrom]?.[xFrom]?.users.delete(userId);
    this.nodes[yTo]?.[xTo]?.users.set(userId);
  };
  Graph.prototype.search = function (xFrom, yFrom, xTo, yTo, direction) {
    var target = this.nodes[yTo]?.[xTo];
    if (!target)
      return;
    var from = this.nodes[yFrom]?.[xFrom];
    if (!from || target === from)
      return;
    var queue = [{node: target, path: {length: 0}}], current, door, flag = target.flag = [true];
    while (current = queue.shift()) {
      var iterator = current.node.edges.entries();
      for (var [node, edge] of iterator) {
        if (node.flag[0] || !edge.reverse || (door && node.door && from !== node))
          continue;
        var i = current.path.length, child = {node, path: {length: i}};
        if (i && current.path[i - 1] !== edge.reverse)
          child.path[child.path.length++] = current.path[i - 1];
        child.path[child.path.length++] = edge.reverse;
        child.path.__proto__ = current.path;
        if (from === node) {
          if (direction !== edge.reverse)
            child.path[child.path.length++] = edge.reverse;
          flag[0] = false;
          var path = Array.from(child.path).reverse();
          if (target.blocked && target.blocked !== child.path[0])
            path.push(target.blocked);
          return path;
        }
        node.flag = flag;
        if (node.door) {
          if (node.door.direction !== edge.reverse)
            child.path[child.path.length++] = edge.reverse;
          child.path[child.path.length++] = [this.room, node.door.id];
          door = Array.from(child.path).reverse();
          if (target.blocked && target.blocked !== child.path[0])
            door.push(target.blocked);
          continue;
        }
        queue.push(child);
      }
    }
    flag[0] = false;
    return door || (target.door && [[this.room, target.door.id]]);
  };
  Graph.prototype.escape = function ({x, y, direction}, far) {
    var currentNode = this.nodes[y]?.[x];
    if (!currentNode || currentNode.users.size < 2 || currentNode.door?.target)
      return;
    // いかおに
    if (ikaoni.playing && !ikaoni.ikaed) {
      Object.keys(ikaoni.players).some(id => {
        if (currentNode.users.has(id) && vueApp.myUserID !== id && vueApp.users[id]?.character?.characterName === 'ika') {
          sendMessage('#ika');
          systemMessage('イカにされた');
          return ikaoni.ikaed = true;
        }
      });
    }
    if (!experimentalConfig.escape || !this.moved)
      return;
    var candidate = [], second = [];
    var queue = [{node: currentNode, path: {length: 0}}], current, flag = currentNode.flag = [true];
    while (current = queue.shift()) {
      var iterator = current.node.edges.entries();
      for (var [node, edge] of iterator) {
        if (node.flag[0] || !edge.direction || node.door)
          continue;
        var i = current.path.length, child = {node, path: {length: i}};
        if ((current.path[i - 1] || direction) !== edge.direction)
          child.path[child.path.length++] = edge.direction;
        child.path[child.path.length++] = edge.direction;
        child.path.__proto__ = current.path;
        node.flag = flag;
        queue.push(child);
        (node.users.size || (far && child.path.length < 4) ? second : candidate).push(child.path);
      }
      if (!far)
        break;
    }
    flag[0] = false;
    return Array.from((candidate.length ? candidate[Math.random() * candidate.length | 0] : second[Math.random() * second.length | 0]) || []);
  };
  // ダブルクリックで移動
  var physicalToLogical = function (x, y) {
    var room = vueApp.currentRoom, scale = vueApp.getCanvasScale();
    var blockWidth = room.blockWidth || 80, blockHeight = room.blockHeight || 40;
    x = ((x - vueApp.canvasGlobalOffset.x) / scale - room.originCoordinates.x) / blockWidth;
    y = (room.originCoordinates.y - (blockHeight / 2) - (y - vueApp.canvasGlobalOffset.y) / scale) / blockHeight;
    return {x: Math.floor(x - y), y: Math.floor(x + y)};
  };
  document.addEventListener('dblclick', event => {
    var devicePixelRatio = experimentalConfig.disablePixelRatio ? 1 : window.devicePixelRatio;
    if (event.target.id === 'room-canvas' && !experimentalConfig.disableMove && !ikaoni.playing && !vueApp.route.isRunning()) {
      var from = vueApp.users[vueApp.myUserID], to = physicalToLogical(event.offsetX * devicePixelRatio, event.offsetY * devicePixelRatio);
      vueApp.route.run(graph?.search(from.logicalPositionX, from.logicalPositionY, to.x, to.y, from.direction));
    }
  });
  // 経路移動
  vueApp.route = {
    queue: [],
    move: function (direction) {
      var t = performance.now();
      if (
        vueApp.isLoadingRoom ||
        vueApp.requestedRoomChange ||
        vueApp.isWaitingForServerResponseOnMovement ||
        (vueApp.users[vueApp.myUserID]?.isWalking && !(document.hidden && t - this.lastMovement > 1000))
      )
        return false;
      vueApp.socket?.emit('user-move', direction);
      this.lastMovement = t;
      return vueApp.isWaitingForServerResponseOnMovement = true;
    },
    run: async function (q) {
      if (this.isRunning() || !q || q.constructor !== Array || !q.length)
        return;
      this.queue = q;
      while (this.queue.length) {
        if (typeof this.queue[0] === 'string')
          while (this.isRunning() && !this.move(this.queue[0]))
            await sleep(100);
        else
          await vueApp.changeRoom.apply(vueApp, this.queue[0]);
        this.queue.shift();
      }
    },
    clear: function () {
      this.queue = [];
    },
    isRunning: function () {
      return this.queue.length;
    },
    lastMovement: 0
  };
  var sendNewPositionToServer = vueApp.sendNewPositionToServer;
  vueApp.sendNewPositionToServer = function () {
    if (vueApp.isWaitingForServerResponseOnMovement)
      return;
    var value = sendNewPositionToServer.apply(this, arguments);
    if (vueApp.isWaitingForServerResponseOnMovement)
      vueApp.route.clear();
    return value;
  };
  // URL短縮
  document.addEventListener('paste', async event => {
    if (event.target.id === 'input-textbox') {
      var url = event.clipboardData.getData('text');
      if (url.length > (event.target.maxLength || 500) - event.target.value.length - 30 && /^(?:https?:\/\/[^\/]|data:)/.test(url)) {
        event.preventDefault();
        if (url.startsWith('data:')) {
          asyncAlert(text('長いdata URLは貼り付けられません', 'Cannot paste long data URL'));
          return;
        }
        var end, failed = function (cause) {
          if (end)
            return;
          end = true;
          cause = [text('タイムアウトにより', 'timeout'), text('エラーにより', 'shortener error')][cause];
          asyncAlert(text(cause + '短縮に失敗しました。', 'Failed to shorten URL cause by ' + cause + '.'));
        };
        if (
          experimentalConfig.confirmURLShortening &&
          !await asyncConfirm(text('貼り付けようとしたURLが最大文字数を超えています。URLを短縮しますか？', 'Pasted URL is too long. Do you shorten this URL?') + '\n' + url.slice(0, 100) + '...')
        )
          return;
        setTimeout(() => failed(0), +experimentalConfig.shortenerTimeout * 1000 || 3000);
        try {
          var shortURL = (await (await fetch('https://is.gd/create.php?format=json&url=' + encodeURIComponent(url))).json()).shorturl;
        } catch (err) {
          consolelog(err);
        }
        if (end)
          return;
        if (!shortURL || shortURL.indexOf('https://is.gd/'))
          failed(1);
        else
          event.target.value += shortURL;
        end = true;
      }
    }
  });
  // nimado
  var nimado = function () {
    if (nimado !== this)
      return nimado.call(nimado);
    var users = Object.values(vueApp.users).filter(u => u.id !== vueApp.myUserID);
    this.stopCount = users.length;
    this.dead = [];
    this.users = [];
    users.forEach(u => setTimeout(()=>abon(u.id), 0));
  };
  nimado.count = function (userCount) {
    if (!this.stopCount)
      return;
    if (this.dead.length > 1)
      this.users.push('(' + this.dead.join(' = ') + ')');
    this.dead = [];
    if (!--this.stopCount)
      systemMessage(text(`二窓ユーザーが${this.users.length}人いました。${this.users}`, `${this.users.length} duplicate users.${this.users}`));
  };
  nimado.left = function (name) {
    if (!this.stopCount)
      return;
    this.dead.push(name);
  };
  // いかおに
  var ikaoni = {
    timerId: 0,
    masterId: '',
    lastPlayTime: 0,
    players: {},
    WAIT_SECONDS: 30,
    PLAY_MINUTES: 5
  };
  ikaoni.waiting = () => (new Date()).getTime() - ikaoni.lastPlayTime < ikaoni.WAIT_SECONDS * 1000;
  ikaoni.MASTER_WORD = 'いかおにをする人は' + ikaoni.WAIT_SECONDS + '秒以内に「いかおに」と発言してください。(拡張機能が必要)';
  ikaoni.start = master => {
    ikaoni.playing = true;
    clearTimeout(ikaoni.timerId);
    ikaoni.timerId = setTimeout(() => {
      delete ikaoni.playing;
      if (vueApp.users[vueApp.myUserID]?.character?.characterName !== 'ika')
        systemMessage('イカから逃げ切ったのであなたの勝ちです。おめでとう。');
      else
        systemMessage(ikaoni.PLAY_MINUTES + '分経ったのでいかおにを終了します。');
    }, ikaoni.PLAY_MINUTES * 60000);
    if (master) {
      ikaoni.waitTimerId = setTimeout(() => {
        var entries = Object.entries(ikaoni.players);
        if (entries.length > 1) {
          var [ikaId, ikaName] = entries.splice(Math.random() * entries.length | 0, 1)[0];
          sendMessage(ikaId + ' \n最初のイカは' + ikaName + 'です。' + entries.map(a => a[1]).join('、') + 'は' + ikaoni.PLAY_MINUTES + '分間イカから逃げてください。スタート', true);
        } else {
          ikaoni.abort('参加者が集まりませんでした。');
        }
      }, ikaoni.WAIT_SECONDS * 1000);
      sendMessage(ikaoni.MASTER_WORD, true);
    } else {
      sendMessage('いかおに', true);
    }
  };
  ikaoni.abort = cause => {
    systemMessage(cause);
    clearTimeout(ikaoni.waitTimerId);
    clearTimeout(ikaoni.timerId);
    ikaoni.playing = ikaoni.lastPlayTime = 0;
  };
  var requestRoomList = vueApp.requestRoomList;
  vueApp.requestRoomList = function () {
    if (ikaoni.playing) {
      systemMessage('いかおに中はﾙｰﾗ出来ません。');
      return;
    }
    return requestRoomList.apply(this, arguments);
  };
  // ユーザーのメッセージ送信
  var sendMessageToServer = vueApp.sendMessageToServer;
  vueApp.sendMessageToServer = function () {
    var t = document.getElementById('input-textbox');
    if (t) {
      if (t.value === '#nimado') {
        nimado();
        t.value = '';
        return;
      } else if (t.value.startsWith('#block ')) {
        vueApp.socket.emit('user-block', t.value.slice(7));
        t.value = '';
        return;
      } else if (t.value.startsWith('#select ')) {
        var id = t.value.slice(8);
        vueApp.highlightUser(id, id);
        t.value = '';
        return;
      } else if (t.value === '#config') {
        document.getElementById('configButton')?.click();
        t.value = '';
        return;
      } else if (t.value === '#ver') {
        t.value = VERSION;
      } else if (t.value === '#error') {
        downloadErrorLog();
        t.value = '';
        return;
      } else if (t.value === '#ikaoni') {
        if (vueApp.characterId === 'shar_naito' || vueApp.users[vueApp.myUserID].character?.characterName === 'ika')
          systemMessage('足の速いキャラとイカは出来ません。');
        else if (ikaoni.playing)
          systemMessage('既にプレイ中です。');
        else
          ikaoni.start(true);
        t.value = '';
        return;
      } else if (t.value === 'いかおに') {
        if (vueApp.characterId === 'shar_naito' || vueApp.users[vueApp.myUserID].character?.characterName === 'ika')
          systemMessage('足の速いキャラとイカは参加できません。');
        else if (ikaoni.playing)
          systemMessage('既にプレイ中です。');
        else if (!ikaoni.waiting())
          systemMessage('途中参加は出来ません。');
        else
          ikaoni.start();
        t.value = '';
        return;
      } else if (t.value === 'やめる' && ikaoni.playing) {
        ikaoni.abort('いかおにをやめました。');
        t.value = '';
        return;
      }
    }
    return sendMessageToServer.apply(this, arguments);
  };
  // チェス棋譜
  var fens = [], pgnButton = document.createElement('button'), pgnWindow;
  pgnButton.onclick = async function () {
    try {
      if (!pgnWindow || pgnWindow.closed)
        throw 1;
      pgnWindow.location.href;
      pgnWindow.focus();
    } catch (err) {
      pgnWindow = open('about:blank');
    }
    if (!pgnWindow) {
      asyncAlert(text('ポップアップを許可してください', 'Allow to popup'));
      return;
    }
    if (pgnWindow.document.readyState !== 'complete')
      await new Promise(resolve => pgnWindow.onload = resolve);
    writeChessHTML(pgnWindow.document, pgnButton.textContent, fens, text('分析', 'Analyze'));
  };
  var getChessMovement = function () {
    if (fens.length < 2)
      return;
    try {
      var before = fens[fens.length - 2].split(' ')[0].replace(/[1-8]/g, n => ' '.repeat(n)).replace(/\//g, '');
      var after = fens[fens.length - 1].split(' ')[0].replace(/[1-8]/g, n => ' '.repeat(n)).replace(/\//g, '');
      for (var i = 0; i < after.length; i++)
        if (after[i] !== ' ' && before[i] !== after[i])
          return 'abcdefgh'[i % 8] + (8 - Math.floor(i / 8));
    } catch (err) {
      consolelog(err);
    }
  };
  var chessSquare;
  var updateFEN = function () {
    if (chessSquare)
      chessSquare.style.backgroundColor = '';
    var address = getChessMovement();
    if (address && (chessSquare = document.querySelector('[data-square=' + address + ']')))
      chessSquare.style.backgroundColor = '#faa';
    if (document.contains(pgnButton))
      return;
    document.querySelector('.chessboard-slot-wrapper :last-child')?.before(pgnButton);
    pgnButton.textContent = text('棋譜', 'Notation');
  };
  // クリックで吹き出しを削除
  var bubbleUsers = [], selectedBubbleUser;
  var drawBubbles = vueApp.drawBubbles;
  vueApp.drawBubbles = function () {
    bubbleUsers.length = 0;
    var value = drawBubbles.apply(this, arguments), area;
    if (area = selectedBubbleUser?.bubbleArea) {
      vueApp.canvasContext.beginPath();
      vueApp.canvasContext.rect(area.x0, area.y0, area.width, area.height);
      vueApp.canvasContext.strokeStyle = 'red';
      vueApp.canvasContext.lineWidth = 1;
      vueApp.canvasContext.stroke();
    }
    return value;
  };
  var getBubbleImage = vueApp.getBubbleImage;
  vueApp.getBubbleImage = function (user) {
    var bubbleImage = getBubbleImage.apply(this, arguments);
    if (!bubbleImage)
      return;
    var getImage = bubbleImage.getImage;
    bubbleImage.getImage = function () {
      var image = getImage.apply(this, arguments);
      if (!vueApp.canvasContext)
        return image;
      var area = user.bubbleArea = user.bubbleArea || {};
      area.x0 = user.currentPhysicalPositionX + vueApp.blockWidth/2 + (user.bubblePosition === 'up' || user.bubblePosition === 'right' ? 21 : -21 - user.bubbleImage.width);
      area.y0 = user.currentPhysicalPositionY - (user.bubblePosition === 'down' || user.bubblePosition === 'right'  ? 62 : 70 + user.bubbleImage.height);
      area.x0 = Math.round(vueApp.getCanvasScale() * (area.x0 || 0) + vueApp.canvasGlobalOffset.x);
      area.y0 = Math.round(vueApp.getCanvasScale() * (area.y0 || 0) + vueApp.canvasGlobalOffset.y);
      area.x1 = area.x0 + image.width;
      area.y1 = area.y0 + image.height;
      area.width = image.width;
      area.height = image.height;
      bubbleUsers.unshift(user);
      return image;
    };
    return bubbleImage;
  };
  var currentX, currentY;
  var bubbleAreaCondition = ({bubbleArea}) => bubbleArea.x0 <= currentX && currentX <= bubbleArea.x1 && bubbleArea.y0 <= currentY && currentY <= bubbleArea.y1;
  var selectBubbleEvent = event => {
    var lastSelected = selectedBubbleUser, x, y;
    if (event?.target?.id === 'room-canvas') {
      currentX = event.offsetX * devicePixelRatio;
      currentY = event.offsetY * devicePixelRatio;
      selectedBubbleUser = bubbleUsers.find(bubbleAreaCondition);
    } else {
      selectedBubbleUser = null;
    }
    if (lastSelected !== selectedBubbleUser)
      vueApp.isRedrawRequired = true;
  };
  addEventListener('mousedown', selectBubbleEvent);
  var lastMouseMoveEvent = {};
  addEventListener('mousemove', event => {
    if (lastMouseMoveEvent.x !== event.x || lastMouseMoveEvent.y !== event.y)
      selectBubbleEvent(event.buttons ? null : event);
    lastMouseMoveEvent = event;
  });
  addEventListener('click', event => {
    if (event.target.id === 'room-canvas' && selectedBubbleUser) {
      selectedBubbleUser.message = '';
      selectedBubbleUser = null;
      vueApp.isRedrawRequired = true;
    }
  });
  var COMMENT_TIMES_LENGTH = 4
  var recordInterval = function (user) {
    if (!user.commentTimes)
      user.commentTimes = Array(COMMENT_TIMES_LENGTH).fill(-Infinity);
    user.commentTimes.push(user.lastCommentTime = (new Date()).getTime());
    if (user.commentTimes.length > COMMENT_TIMES_LENGTH)
      user.commentTimes.shift();
  };
  // socket event
  var streamStates = [];
  var socketEvent = function (eventName) {
    switch (eventName) {
      case 'server-character-changed':
        if (arguments[1] === vueApp.myUserID)
          gamepad.vibrate();
        break;
      case 'server-move':
        var dto = arguments[1], user = vueApp.users[dto.userId];
        // グラフ
        if (dto && user)
          graph?.update(dto.userId, user.logicalPositionX, user.logicalPositionY, dto.x, dto.y);
        // 経路移動
        if (dto?.direction && dto?.userId === vueApp.myUserID && graph)
          graph.moved = true;
        // 重なり回避
        if (!(vueApp.route.isRunning() || (dto?.userId !== vueApp.myUserID && vueApp.isWaitingForServerResponseOnMovement))) {
          var myself = vueApp.users[vueApp.myUserID];
          vueApp.route.run(graph.escape(dto?.userId === vueApp.myUserID ? dto : {x: myself?.logicalPositionX, y: myself?.logicalPositionY, direction: myself?.direction}, experimentalConfig.escape === 2));
        }
        break;
      case 'server-reject-movement':
        gamepad.vibrate();
        // 重なり回避
        if (!vueApp.route.isRunning()) {
          var myself = vueApp.users[vueApp.myUserID];
          vueApp.route.run(graph.escape({x: myself?.logicalPositionX, y: myself?.logicalPositionY, direction: myself?.direction}, experimentalConfig.escape === 2));
        }
        break;
      case 'server-user-joined-room':
        var user = arguments[1];
        // グラフ
        if (user)
          graph?.update(user.id, null, null, user.position.x, user.position.y);
        // 重なり回避
        if (!(vueApp.route.isRunning() || (user.id !== vueApp.myUserID && vueApp.isWaitingForServerResponseOnMovement))) {
          var myself = vueApp.users[vueApp.myUserID];
          vueApp.route.run(graph.escape(user.id === vueApp.myUserID
            ? {x: user.position.x, y: user.position.y, direction: user.direction}
            : {x: myself?.logicalPositionX, y: myself?.logicalPositionY, direction: myself?.direction}
          , experimentalConfig.escape === 2));
        }
        // 入室ログ
        setTimeout(() => {
          if (!user || user.id === vueApp.myUserID)
            return;
          if (user.aboned)
            return;
          // 最終発言時間
          if (vueApp.users[user.id])
            recordInterval(vueApp.users[user.id]);
          if (!experimentalConfig.withoutAnon || !isAnon(user.name)) {
            if (experimentalConfig.accessLog)
              systemMessage(addIHash(user.name, user.id) + text('が入室', ' has entered the room.') + (experimentalConfig.accessLog === 2 ? ' (ID:' + user.id +')' : ''));
            accessNotification(user, text('入室', 'join'));
          }
          widget.access(user.id, user.name, true);
        }, 0);
        break;
      case 'server-user-left-room':
        var user = vueApp.users[arguments[1]];
        // グラフ
        if (user)
          graph?.update(arguments[1], user.logicalPositionX, user.logicalPositionY, null, null);
        // 退室ログ
        if (!user || user.id === vueApp.myUserID || user.aboned)
          return;
        if (!vueApp.ignoredUserIds.has(user.id) && !(experimentalConfig.withoutAnon && isAnon(user.name))) {
          if (experimentalConfig.accessLog)
            systemMessage(addIHash(user.name, user.id) + text('が退室', ' has exited the room.') + (experimentalConfig.accessLog === 2 ? ' (ID:' + user.id +')' : ''));
          accessNotification(user, text('退室', 'exit'));
        }
        widget.access(user.id, user.name);
        // 配信通知
        var stream = vueApp.streams.find(s => s.userId === user.id);
        if (stream)
          stream.isActive = false;
        // nimado
        nimado.left(user.name);
        break;
      case 'server-msg':
        var user = vueApp.users[arguments[1]];
        if (!user)
          return;
        widget.comment(user.id, user.name, arguments[2]);
        if (user.id === vueApp.myUserID)
          break;
        // 最終発言時間
        if (arguments[2])
          recordInterval(user);
        // 連投あぼーん
        if (arguments[2] && experimentalConfig.spammer && user.commentTimes.length > 1) {
          user.commentInterval = (user.lastCommentTime - user.commentTimes[user.commentTimes.length - 2]) / 1000;
          user.commentIntervalAverage = (user.lastCommentTime - user.commentTimes[0]) / (user.commentTimes.length - 1) / 1000;
          var causeByAverage = experimentalConfig.minMsgIntervalAverage && +experimentalConfig.minMsgIntervalAverage > user.commentIntervalAverage;
          if ((experimentalConfig.minMsgInterval && +experimentalConfig.minMsgInterval > user.commentInterval) || causeByAverage) {
            var tail = ' (' + (causeByAverage ? 'Avg. ' + user.commentIntervalAverage : user.commentInterval) + ')';
            if (experimentalConfig.spammer === 1 && !vueApp.ignoredUserIds.has(user.id)) {
              vueApp.ignoreUser(user.id);
              if (!experimentalConfig.hideSpamAbonMsg)
                systemMessage(user.name + text('を連投一方あぼーんした', ' has been ignored because of spam') + tail);
            } else if (experimentalConfig.spammer === 2) {
              abon(user.id);
              if (!experimentalConfig.hideSpamAbonMsg)
                systemMessage(user.name + text('を連投相互あぼーんした', ' has been blocked because of spam') + tail);
            }
          }
        }
        // 呼び出し通知
        mentionNotification(user, arguments[2]);
        break;
      case 'server-update-current-room-state':
        // 配信通知
        streamStates = arguments[1].streams.map(s => s.isActive && s.isReady && s.isAllowed && s.userId !== vueApp.myUserID);
        // ステミキ表示
        wsm.show(arguments[1].streams.some(s => s.userId === vueApp.myUserID && s.isActive && s.isReady && s.withSound));
        // チェス棋譜
        fens = [];
        break;
      case 'server-update-current-room-streams':
        // 配信通知
        var currentStates = arguments[1].map(s => s.isActive && s.isReady && s.isAllowed && s.userId !== vueApp.myUserID);
        var index = currentStates.findIndex((s, i) => s && !streamStates[i] && !vueApp.takenStreams[i]);
        streamStates = currentStates;
        if (index !== -1) {
          var user = vueApp.users[arguments[1][index].userId];
          streamNotification(user, index);
          widget.streaming(user.id, user.name);
        }
        // ステミキ表示
        wsm.show(arguments[1].some(s => s.userId === vueApp.myUserID && s.isActive && s.isReady && s.withSound));
        break;
      // 全部屋ﾙｰﾗ
      case 'server-room-list':
        var streams = 0;
        arguments[1].forEach(room => streams += room.streams.length);
        arguments[1].push(
          {id: 'admin_old', group: 'gikopoi', userCount: '?', streamers: [], streams: +vueApp.serverStats.streamCount <= streams ? [] : [{userName: '?'}]},
          {id: 'badend', group: 'gikopoipoi', userCount: '?', streamers: [], streams: []}
        );
        break;
      case 'server-update-chessboard':
        var state = arguments[1] || {};
        // チェス通知
        if (state[{w: 'whiteUserID', b: 'blackUserID'}[state.turn]] === vueApp.myUserID)
          chessNotification();
        // チェス棋譜
        if (arguments[1].fenString) {
          if (arguments[1].fenString === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
            fens = [arguments[1].fenString];
          else if (fens[fens.length - 1] !== arguments[1].fenString)
            fens.push(arguments[1].fenString);
          updateFEN();
        }
        break;
      // nimado
      case 'server-stats':
        nimado.count();
        break;
    }
  };
  var _io = window.io;
  if (_io) {
    window.io = function () {
      var socket = _io.apply(this, arguments);
      socket.prependAny(socketEvent);
      return socket;
    };
    if (vueApp.socket)
      vueApp.socket.prependAny(socketEvent);
  } else {
    (await getObjectAsync(vueApp, 'socket')).prependAny(socketEvent);
  }

})();

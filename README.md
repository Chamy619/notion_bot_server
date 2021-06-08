# notion_bot_server
노션 봇 서버입니다.

## 서버 실행

1. `config` 디렉터리를 생성하고 디렉터리 내에 `databaseURI.js` 파일을 생성하세요.
2. `databaseURI.js`  파일 내에 mongoDB URI 아래 형태로 작성해 주세요.

```javascript
module.exports = {
    mongoURI: 'mongoDB URI'
}
```


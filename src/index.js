const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const {User} = require('./models/User.js');

app.post('/api/user/login', (req, res) => {
    const tokenId = req.headers.authorization;
    User.findOne({email: req.body.email}, (err, userInfo) => {
        if (err) {
            res.json({success: false});
            return;
        }

        if (!userInfo) {
            // 회원가입 진행
            const newUserInfo = req.body;
            newUserInfo.tokenId = tokenId;
            const user = new User(newUserInfo);
            user.save((err) => {
                if (err) {
                    res.json({success: false});
                    return;
                }
            });
        } else {
            // tokenId 갱신
            User.updateOne({email: req.body.email}, {tokenId}, (err) => {
                if (err) {
                    res.json({success: false});
                    return;
                }
            });
        }

        res.json({success: true, userInfo: {
            name: req.body.name,
            image: req.body.image
        }});
    });
});

app.get('/api/user/logout', (req, res) => {
    const tokenId = req.headers.authorization;
    User.findOneAndUpdate({tokenId}, {tokenId: ''}, (err) => {
        if (err) {
            res.json({success: false});
            return;
        }
        res.json({success: true});
    });
})

// 로그인 여부 확인
app.get('/api/user/auth', (req, res) => {
    const tokenId = req.headers.authorization;
    if (!tokenId) {
        res.json({isLogin: false});
        return;
    }

    User.findOne({tokenId: tokenId}, (err, userInfo) => {
        if (err || !userInfo) {
            res.json({isLogin: false});
            return;
        }

        res.json({isLogin: true});
    });
});

const {connect} = require('./database/database.js');
connect();

const PORT = 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
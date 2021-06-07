const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const {User} = require('./models/User.js');

// 네이버 로그인시 사용자 정보를 프론트 단에서는 가져올 수 없어서 서버에서 처리
app.post('/api/user/naver/login', (req, res) => {
    const token = req.body.access_token;
    const header = `Bearer ${token}`;

    const request = require('request');
    const options = {
        url: 'https://openapi.naver.com/v1/nid/me',
        headers: {'Authorization': header}
    };

    request.get(options, (err, response, body) => {
        if (!err && response.statusCode == 200) {
            const profile = JSON.parse(body);
            
            User.findOne({email: profile.response.email}, (err, userInfo) => {
                if (err) {
                    res.json({success: false});
                    return;
                }

                if (!userInfo) {
                    const newUser = new User({
                        email: profile.response.email,
                        image: profile.response.profile_image,
                        name: profile.response.name,
                        tokenId: token
                    });
                    
                    newUser.save((err) => {
                        if (err) {
                            res.json({success: false});
                            return;
                        }
                    });
                } else {
                    User.updateOne({email: profile.response.email}, {tokenId: token}, (err) => {
                        if (err) {
                            res.json({success: false});
                            return;
                        }
                    });
                }
                res.json({success: true, userInfo: {
                    name: profile.response.name,
                    image: profile.response.profile_image
                }});
                return;
            });
        } else {
            console.log('Naver login error');
            if (response !== null) {
                console.log(`err = ${response.statusCode}`);
            }
            res.json({success: false});
            return;
        }
    });
})

app.post('/api/user/login', async (req, res) => {
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
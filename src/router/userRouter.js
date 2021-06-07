const router = require('express').Router();
const {User} = require('../models/User.js');

// 네이버에서 회원 정보 가져옴
const getNaverProfile = (tokenId) => {
    const header = `bearer ${tokenId}`;
    return new Promise((resolve, reject) => {
        const request = require('request');
        const options = {
            url: 'https://openapi.naver.com/v1/nid/me',
            headers: {'Authorization': header}
        };

        request.get(options, (err, response, body) => {
            if (!err && response.statusCode == 200) {
                return resolve(JSON.parse(body).response);
            } else {
                console.log('Naver login error');
                if (response !== null) {
                    console.log(`err = ${response.statusCode}`);
                }
                return reject('Can\' get user profile');
            }
        });
    });
}

router.post('/login', async (req, res) => {
    const tokenId = req.headers.authorization;

    // 네이버 로그인 한 경우 회원 정보를 네이버에서 받아온 후 req.body에 저장
    if (!req.body.email) {
        const profile = await getNaverProfile(tokenId);
        req.body = {
            email: profile.email,
            name: profile.name,
            image: profile.profile_image
        };
    }

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

router.get('/logout', (req, res) => {
    const tokenId = req.headers.authorization;
    User.findOneAndUpdate({tokenId}, {tokenId: ''}, err => {
        if (err) {
            return res.json({success: false});
        }
        return res.json({success: true});
    });
});

router.get('/auth', (req, res) => {
    const tokenId = req.headers.authorization;
    if (!tokenId) {
        return res.json({isLogin: false});
    }

    User.findOne({tokenId}, (err, userInfo) => {
        if (err || !userInfo) {
            return res.json({isLogin: false});
        }

        return res.json({isLogin: true});
    });
});

module.exports = router;
@echo off
setlocal enabledelayedexpansion

set "REMOTE_USER=ubuntu"
set "REMOTE_HOST=Turbocontent.art"
set "REMOTE_DIR=/home/ubuntu"

echo Starting export of MongoDB collections...

ssh -l %REMOTE_USER% %REMOTE_HOST% "docker exec turbocontent_mongodb_1 mongoexport --db turbocontent --collection users --type=csv --fields=_id,email,firstName,lastName,subscriptionStatus,subscriptionId,createdAt,preferences,lastLogin,emailVerified,isAdmin > users.csv"
ssh -l %REMOTE_USER% %REMOTE_HOST% "docker exec turbocontent_mongodb_1 mongoexport --db turbocontent --collection contents --type=csv --fields=_id,title,model,userId,slides > contents.csv"
ssh -l %REMOTE_USER% %REMOTE_HOST% "docker exec turbocontent_mongodb_1 mongoexport --db turbocontent --collection feedbacks --type=csv --fields=userId,type,message,createdAt,updatedAt > feedbacks.csv"

scp %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_DIR%/users.csv .
scp %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_DIR%/contents.csv .
scp %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_DIR%/feedbacks.csv .


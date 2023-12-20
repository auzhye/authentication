import express from 'express';
import jsonWebToken from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
var router = new express.Router();
const prisma = new PrismaClient();

async function isAdmin(id) {
 const admin = await prisma.user.findUnique({where:{role:"ADMIN", id:id}});
 if (admin) {
  return true;
 } else {
  return false;
 }
}
router.get(['/', '/:id'], async function(req, res, next) {
 const paths = ["api", "users", undefined]
 const dataParams = req.params;
 const dataQuery = req.query;
 if (req.signedCookies.token) {
  if(isAdmin(jsonWebToken.verify(req.signedCookies.token, process.env.SECRET).id) && Object.values(dataParams).some((param) => paths.includes(param))) {
   if (dataParams.id = "users") {
    const users = await prisma.user.findMany({where:{role:"USER"}});
    return res.json(users);
   }
   return res.json({ params: dataParams, query:dataQuery });
  } else {
   return res.status(401).json("error");
  }
 }
 return next();
})
.get("/users/:id", async (req, res, next) => {
 const dataParams = req.params;
 if (req.signedCookies.token) {
  if(isAdmin(jsonWebToken.verify(req.signedCookies.token, process.env.SECRET).id)) {
   if (dataParams.id) {
    const users = await prisma.user.findUnique({where:{id:parseInt(dataParams.id)}});
    return res.json(users);
   }
   return res.json({ params: dataParams, query:dataQuery });
  } else {
   return res.status(401).json("error");
  }
 }
 return next();
});

export default router;
const {tokenController,myToken}=require("../controller/agora");
const express=require("express");
const router=express.Router();

router.get("/token",tokenController);
router.get("/myToken",myToken)

module.exports=router;
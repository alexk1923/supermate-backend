import jwt, { Secret } from "jsonwebtoken"

import { NextFunction, Request, Response } from "express";
import UserCredential from "../models/userCredentialModel.js";
import { Sequelize } from "sequelize";
import bcrypt from "bcrypt"
import { UserCreation } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import userService from "../services/userService.js";

const login = async (req: Request, res: Response) => {
    try {
        const {username, email, password } = req.body;

        if (!process.env.TOKEN_KEY) {
            throw new Error('TOKEN_KEY is not defined');
        }

        let existingUser = null;
        if(username) {
            existingUser = await UserCredential.findOne({where:{username}});
        }

        if(email) {
            existingUser = await UserCredential.findOne({where: {email}});
        }


          
        if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
            const token = jwt.sign({ userID: existingUser.id, email }, process.env.TOKEN_KEY as Secret, {
                expiresIn: "1 day"
            });

            return res.status(200).send({
                "id": existingUser.id,
                "email": existingUser.email,
                "username": existingUser.username,
                "token": token,
                // more properties can be added
            });
        }

        return res.status(400).json({ err: "Wrong credentials. Please try again" });

    } catch (err) {
        console.log(err);
    }
}

async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const userRegisterData : UserCreation = {
            username: req.body.username,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birthday: req.body.birthday,
            password: req.body.password
        };

        const user =  await userService.createUser(userRegisterData);
    
        res.status(StatusCodes.CREATED).send(user);
        
    } catch (err) {
        next(err);
    }
}

export {login, register}



import { auth } from "@/auth";
import { ObjectId } from "mongodb";

export async function getUserIdFromSession() {
    const session = await auth();
    if (!session || !session.user?.id || !ObjectId.isValid(session.user.id)) {
        throw new Error('ユーザーが認証されていません。');
    }
    return new ObjectId(session.user.id);
}
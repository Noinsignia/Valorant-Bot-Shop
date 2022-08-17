import {fetch, isMaintenance} from "../misc/util.js";
import {deleteUserAuth} from "./auth.js";


export const getEntitlements = async (user, itemTypeId, itemType="item") => {
    // https://github.com/techchrism/valorant-api-docs/blob/trunk/docs/Store/GET%20Store_GetEntitlements.md
    const req = await fetch(`https://pd.${user.region}.a.pvp.net/store/v1/entitlements/${user.puuid}/${itemTypeId}`, {
        headers: {
            "Authorization": "Bearer " + user.auth.rso,
            "X-Riot-Entitlements-JWT": user.auth.ent
        }
    });

    console.assert(req.statusCode === 200, `Valorant ${itemType} entitlements code is ${req.statusCode}!`, req);

    const json = JSON.parse(req.body);
    if (json.httpStatus === 400 && json.errorCode === "BAD_CLAIMS") {
        deleteUserAuth(user);
        return { success: false };
    } else if (isMaintenance(json))
        return { success: false, maintenance: true };

    return {
        success: true,
        entitlements: json
    }

}

export const getSkins = async (user) => {
    const data = await getEntitlements(user, "e7c63390-eda7-46e0-bb7a-a6abdacd2433", "skins");
    if(!data.success) return data;

    return {
        success: true,
        skins: data.entitlements.Entitlements.map(ent => ent.ItemID)
    }
}

export const getLoadout = async (user) => {
    const req = await fetch(`https://pd.${user.region}.a.pvp.net/personalization/v2/players/${user.puuid}/playerloadout`, {
        headers: {
            "Authorization": "Bearer " + user.auth.rso,
            "X-Riot-Entitlements-JWT": user.auth.ent
        }
    });

    console.assert(req.statusCode === 200, `Valorant loadout fetch code is ${req.statusCode}!`, req);

    const json = JSON.parse(req.body);
    if (json.httpStatus === 400 && json.errorCode === "BAD_CLAIMS") {
        deleteUserAuth(user);
        return { success: false };
    } else if (isMaintenance(json))
        return { success: false, maintenance: true };

    return {
        success: true,
        loadout: json
    }
}

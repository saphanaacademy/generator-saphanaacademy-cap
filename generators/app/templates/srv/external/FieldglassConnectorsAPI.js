const cds = require('@sap/cds');
const debug = require('debug')('srv:FieldglassConnectorsAPI');
const cloudSDKCore = require('@sap-cloud-sdk/core');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FieldglassConnectorsAPI {

    static async jobSeekerSubmit(req) {
        try {
            debug(req.data);
            let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../templates/FieldglassConnectorsJobseeker.json'), 'utf-8'));
            data.HumanResource.HumanResourceId['@validFrom'] = req.data.startDate;
            data.HumanResource.HumanResourceId['@validTo'] = req.data.endDate;
            data.HumanResource.HumanResourceId.ExternalReferenceId = uuidv4();
            data.HumanResource.HumanResourceId.EntityContactInfo.PersonName.LegalName = "API_" + process.env.FGCNsupplierId;
            data.HumanResource.ReferenceInformation.StaffingSupplierId.IdValue = process.env.FGCNsupplierId;
            data.HumanResource.ReferenceInformation.StaffingCustomerId.IdValue = process.env.FGCNclientId;
            data.HumanResource.ReferenceInformation.OrderId.IdValue = req.data.jobPostingId;
            data.HumanResource.ResourceInformation.EntityContactInfo.PersonName.LegalName = req.data.fullName;
            data.HumanResource.ResourceInformation.EntityContactInfo.PersonName.FirstName = req.data.fullName.split(' ')[0];
            data.HumanResource.ResourceInformation.EntityContactInfo.PersonName.LastName = req.data.fullName.split(' ')[1];
            data.HumanResource.ResourceInformation.EntityContactInfo.SecurityId = req.data.securityId;
            data.HumanResource.ResourceInformation.AvailabilityDate.AvailabilityStartDate = req.data.startDate;
            data.HumanResource.Profile.Resume.NonXMLResume.SupportingMaterials.AttachmentReference['$'] = req.data.resumeName;
            data.HumanResource.Profile.Resume.NonXMLResume.SupportingMaterials.AttachmentReference['@mimeType'] = req.data.resumeMimeType;
            data.HumanResource.Profile.Resume.NonXMLResume.TextResume = req.data.resumeText;
            debug(data);
            const fgcn = await cds.connect.to('FieldglassConnectors');
            let response = await fgcn.tx(req).post('/<%= FGCNJobSeekerUpload %>', data);
            debug(response.Status);
            return response.Status;
        } catch (error) {
            console.error(error.stack, error.innererror.response.body);
            return error.innererror.response.body.Status;
        }
    }

    static async workOrderRespond(req) {
        try {
            debug(req.data);
            let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../templates/FieldglassConnectorsWorkorder.json'), 'utf-8'));
            data.StaffingOrder.AssignmentType.Assignment.AssignmentId['@validFrom'] = req.data.startDate;
            data.StaffingOrder.AssignmentType.Assignment.AssignmentId['@validTo'] = req.data.endDate;
            data.StaffingOrder.AssignmentType.Assignment.AssignmentId.IdValue = req.data.workOrderId;
            data.StaffingOrder.AssignmentType.Assignment.ReferenceInformation.StaffingCustomerId.IdValue = process.env.FGCNclientId;
            data.StaffingOrder.AssignmentType.Assignment.ReferenceInformation.UserArea.JobSeekerId = req.data.jobSeekerId;
            data.StaffingOrder.AssignmentType.Assignment.ReferenceInformation.UserArea.ModificationType = req.data.modificationType;
            data.StaffingOrder.AssignmentType.Assignment.ReferenceInformation.UserArea.Comments = req.data.comments;
            data.StaffingOrder.AssignmentType.Assignment.ContractInformation.ContactMethod.InternetEmailAddress = req.data.email;
            debug(data);
            const fgcn = await cds.connect.to('FieldglassConnectors');
            let response = await fgcn.tx(req).post('/<%= FGCNWorkOrderAcceptUpload %>', data);
            debug(response.Status);
            return response.Status;
        } catch (error) {
            console.error(error.stack, error.innererror.response.body);
            return error.innererror.response.body.Status;
        }
    }

}

module.exports = FieldglassConnectorsAPI;
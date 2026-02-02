import React from "react";
import { Table, TableBody, TableRow } from "@omilia/table";
import { STableLeftBodyCell, STableRightBodyCell } from "../styled";
import { NoteType } from "../../../types";

interface Props {
  crmData: NoteType[] | undefined | null | any;
}
const UserInfoComponent = ({ crmData }: Props) => {
  return (
    crmData && (
      <Table>
        <TableBody>
          {crmData.map((data) => {
            return (
              <TableRow>
                <STableLeftBodyCell style={{ padding: "3px 10px 3px 10px " }}>
                  {data.key}
                </STableLeftBodyCell>
                <STableRightBodyCell style={{ padding: "3px 10px 3px 10px " }}>
                  {data.value}
                </STableRightBodyCell>
              </TableRow>
            );
          })}

          {/*<TableRow>*/}
          {/*    <STableLeftBodyCell style={{padding: '3px 10px 3px 10px '}}>Client Card*/}
          {/*        Information:</STableLeftBodyCell>*/}
          {/*    <STableRightBodyCell style={{padding: '3px 10px 3px 10px '}}>[Last Four Digits of Client's*/}
          {/*        Card]</STableRightBodyCell>*/}
          {/*</TableRow>*/}
          {/*<TableRow>*/}
          {/*    <STableLeftBodyCell style={{padding: '3px 10px 3px 10px '}}>Car Model:</STableLeftBodyCell>*/}
          {/*    <STableRightBodyCell style={{padding: '3px 10px 3px 10px '}}>Ford Range</STableRightBodyCell>*/}
          {/*</TableRow>*/}
          {/*<TableRow>*/}
          {/*    <STableLeftBodyCell style={{padding: '3px 10px 3px 10px '}}>Insurance Type:</STableLeftBodyCell>*/}
          {/*    <STableRightBodyCell*/}
          {/*        style={{padding: '3px 10px 3px 10px '}}>Premium-Guaranteed</STableRightBodyCell>*/}
          {/*</TableRow>*/}
        </TableBody>
      </Table>
    )
  );
};

export default UserInfoComponent;

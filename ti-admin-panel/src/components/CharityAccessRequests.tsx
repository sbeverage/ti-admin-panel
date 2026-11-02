/**
 * The queue for "this person says they work at this charity, should they be
 * able to edit its profile?".
 *
 * Deliberately not folded into the Pending Approvals tabs. Those answer a
 * different question, whether a charity should be visible to donors at all,
 * and the two are independent: a charity can be live with nobody managing it,
 * and an owner can be approved for a charity that is still hidden.
 *
 * Renders nothing when the queue is empty, so it stays out of the way until
 * there is something to decide.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Modal, Input, message, Tooltip,
} from 'antd';
import {
  SafetyCertificateOutlined, WarningOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import { charityAccessAPI } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AccessRequest {
  id: number;
  kind: 'signup' | 'claim';
  status: string;
  createdAt: string;
  domainVerified: boolean;
  contactName: string | null;
  contactTitle: string | null;
  contactPhone: string | null;
  workEmail: string | null;
  note: string | null;
  charity: { id: number; name: string; ein?: string | null; website?: string | null; location?: string | null; hasOwner?: boolean };
  user: { id: number; email?: string; name?: string; accountCreatedAt?: string };
}

const CharityAccessRequests: React.FC = () => {
  const [rows, setRows] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<AccessRequest | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await charityAccessAPI.list('pending');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (r: AccessRequest) => {
    setBusyId(r.id);
    try {
      const res = await charityAccessAPI.approve(r.id);
      message.success(res?.message || `${r.charity.name} is now managed by that account.`);
      load();
    } catch (err: any) {
      message.error(err?.message || 'That did not go through. Give it another try?');
      // Re-read either way: a refusal usually means the real state moved on.
      load();
    } finally {
      setBusyId(null);
    }
  };

  const doReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await charityAccessAPI.reject(rejecting.id, reason.trim() || undefined);
      message.success('Turned down.');
      setRejecting(null);
      setReason('');
      load();
    } catch (err: any) {
      message.error(err?.message || 'That did not go through. Give it another try?');
    } finally {
      setBusyId(null);
    }
  };

  // Nothing waiting: say nothing at all.
  if (loading || rows.length === 0) return null;

  const columns = [
    {
      title: 'Charity',
      key: 'charity',
      render: (_: unknown, r: AccessRequest) => (
        <div>
          <Text strong>{r.charity.name}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {[r.charity.ein, r.charity.location].filter(Boolean).join(' · ') || 'No details on file'}
            </Text>
          </div>
          {r.charity.website && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.charity.website}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Who is asking',
      key: 'who',
      render: (_: unknown, r: AccessRequest) => (
        <div>
          <Text strong>{r.contactName || r.user.name || 'Not given'}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.contactTitle || 'No role given'}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.workEmail || r.user.email}</Text></div>
          {r.contactPhone && (
            <div><Text type="secondary" style={{ fontSize: 12 }}>{r.contactPhone}</Text></div>
          )}
        </div>
      ),
    },
    {
      title: 'Evidence',
      key: 'evidence',
      width: 210,
      render: (_: unknown, r: AccessRequest) =>
        r.domainVerified ? (
          <Tooltip title="Their verified email is on the charity's own web domain, which a free mail address can never be.">
            <Tag icon={<SafetyCertificateOutlined />} color="green">
              Email matches their domain
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title="A personal or mismatched email address. Worth a call to the charity's own contact before approving.">
            <Tag icon={<WarningOutlined />} color="orange">
              Needs a conversation
            </Tag>
          </Tooltip>
        ),
    },
    {
      title: 'Notes',
      key: 'note',
      render: (_: unknown, r: AccessRequest) =>
        r.note ? <Text style={{ fontSize: 12 }}>{r.note}</Text> : <Text type="secondary">None</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_: unknown, r: AccessRequest) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={busyId === r.id}
            onClick={() => approve(r)}
          >
            Give access
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            disabled={busyId === r.id}
            onClick={() => { setRejecting(r); setReason(''); }}
          >
            Turn down
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ marginBottom: 24, borderColor: '#F0D9BE' }}>
      <Space align="center" size={10} style={{ marginBottom: 4 }} wrap>
        <Title level={4} style={{ margin: 0 }}>Charity profile access</Title>
        <Tag color="orange">{rows.length} waiting</Tag>
      </Space>
      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
        People asking to manage a charity's own profile. Approving links their
        account to that charity, so they can edit its details and images. It
        does not make the charity visible to donors, which is a separate
        decision below.
      </Paragraph>

      <Table
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={rows}
        columns={columns as any}
      />

      <Modal
        open={!!rejecting}
        title={`Turn down ${rejecting?.contactName || 'this request'}?`}
        okText="Turn it down"
        okButtonProps={{ danger: true, loading: busyId === rejecting?.id }}
        cancelText="Keep it waiting"
        onCancel={() => setRejecting(null)}
        onOk={doReject}
      >
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          They will see this reason in the portal, so it is worth a sentence
          they can act on. They can ask again afterwards.
        </Paragraph>
        <TextArea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="We could not confirm you work at this charity. Email us from your work address and we will sort it out."
        />
      </Modal>
    </Card>
  );
};

export default CharityAccessRequests;
